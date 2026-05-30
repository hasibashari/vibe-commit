import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import db from '../../db/database.js';

export class LogController {
  static async getLogsForUser(req: Request, res: Response, next: NextFunction) {
    if (req.params.userId !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user logs' });
      return;
    }
    try {
      const logsRes = await db.query(`
        SELECT quest_logs.*, goals.difficulty, goals.created_at as goal_created_at 
        FROM quest_logs 
        JOIN goals ON quest_logs.goal_id = goals.id 
        WHERE goals.user_id = $1 
        ORDER BY quest_logs.timestamp DESC
      `, [req.params.userId]);
      res.json(logsRes.rows);
    } catch (err) {
      next(err);
    }
  }

  static async getLogsForGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goalRes = await db.query('SELECT user_id FROM goals WHERE id = $1', [req.params.goalId]);
      const goal = goalRes.rows[0] as { user_id: string } | undefined;
      if (!goal) {
        res.status(404).json({ error: 'Quest not found' });
        return;
      }
      if (goal.user_id !== (req as any).user?.id) {
        res.status(403).json({ error: 'Forbidden: Access denied to other user quest logs' });
        return;
      }

      const logsRes = await db.query('SELECT * FROM quest_logs WHERE goal_id = $1 ORDER BY timestamp DESC', [req.params.goalId]);
      res.json(logsRes.rows);
    } catch (err) {
      next(err);
    }
  }

  static async createLog(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        id: z.string(),
        goalId: z.string(),
        vibeScore: z.number().nullable().optional(),
        notes: z.string().nullable().optional()
      });
      const { id, goalId, vibeScore, notes } = schema.parse(req.body);
      
      const goalRes = await db.query('SELECT user_id FROM goals WHERE id = $1', [goalId]);
      const goal = goalRes.rows[0] as { user_id: string } | undefined;
      if (!goal) {
        res.status(404).json({ error: 'Quest not found for this log' });
        return;
      }
      if (goal.user_id !== (req as any).user?.id) {
        res.status(403).json({ error: 'Forbidden: Access denied to create log for other user quest' });
        return;
      }

      const client = await db.connect();
      try {
        await client.query('BEGIN');

        // Fetch user's date offset to determine quest log's simulated timestamp
        const userOffsetObjRes = await client.query('SELECT sandbox_date_offset FROM users WHERE id = $1', [goal.user_id]);
        const userOffsetObj = userOffsetObjRes.rows[0] as { sandbox_date_offset: number } | undefined;
        const offset = userOffsetObj?.sandbox_date_offset || 0;

        // Calculate simulated timestamp
        const logTime = new Date();
        if (offset !== 0) {
          logTime.setDate(logTime.getDate() + offset);
        }
        const timestampStr = logTime.toISOString();

        // INSERT ON CONFLICT DO NOTHING makes this idempotent — replayed offline logIds
        // (same UUID sent again during sync) are silently skipped instead of
        // crashing with a UNIQUE constraint error and discarding the action.
        const insertResult = await client.query(
          'INSERT INTO quest_logs (id, goal_id, vibe_score, notes, timestamp) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
          [id, goalId, vibeScore ?? null, notes ?? null, timestampStr]
        );

        // If 0 rows were changed (rowCount === 0) the log already existed — skip reward grant
        // to avoid double-crediting EXP/HP on duplicate requests.
        if (insertResult.rowCount === 0) {
          await client.query('COMMIT');
          res.json({ success: true });
          return;
        }

        // Fetch user associated with this goal
        const goalDataRes = await client.query('SELECT user_id, difficulty, reward_alpha, type FROM goals WHERE id = $1', [goalId]);
        const goalData = goalDataRes.rows[0] as any;
        if (goalData) {
          const userRes = await client.query('SELECT id, hp, mana, level, exp, last_penalty_date FROM users WHERE id = $1', [goalData.user_id]);
          const user = userRes.rows[0] as any;
          if (user) {
            let expGain = 0;
            
            if (goalData.type === 'one-off') {
              // Gacha Burst Logic for One-off Quests
              // RNG Multiplier between 1.5x and 3.0x instead of relying on reward_alpha streak
              const gachaMultiplier = 1.5 + Math.random() * 1.5;
              expGain = Math.floor(10 * (goalData.difficulty || 1.0) * gachaMultiplier);
              
              // Auto-complete the quest
              await client.query("UPDATE goals SET status = 'completed' WHERE id = $1", [goalId]);
            } else {
              // Standard Habit EXP Calculation
              expGain = Math.floor(10 * (goalData.difficulty || 1.0) * (goalData.reward_alpha || 0.5));
            }

            let newExp = user.exp + expGain;
            let newLevel = user.level;

            // Cap level to prevent precision loss
            const MAX_LEVEL = 100;
            const getExpNeeded = (lvl: number) =>
              Math.floor(100 * Math.pow(1.2, Math.min(lvl - 1, MAX_LEVEL - 1)));

            let expNeeded = getExpNeeded(newLevel);
            while (newExp >= expNeeded && newLevel < MAX_LEVEL) {
              newExp -= expNeeded;
              newLevel += 1;
              expNeeded = getExpNeeded(newLevel);
            }

            // Completing a quest restores some HP (+5) up to 100
            const newHp = Math.min(100, user.hp + 5);

            // Mana represents daily focus.
            // First quest of a new day gives a partial mana recovery (+30, capped at 100)
            // instead of a full reset — so inactivity penalties still have lasting impact.
            // Subsequent quests drain 10 mana (effort spent).
            //
            // OBJECTIVE COUNTER: Query PostgreSQL to check how many quest logs the user has completed today.
            const todayLogsRes = await client.query(`
              SELECT COUNT(*) as count 
              FROM quest_logs 
              JOIN goals ON quest_logs.goal_id = goals.id 
              WHERE goals.user_id = $1 
                AND DATE(quest_logs.timestamp) = DATE($2::timestamp)
            `, [user.id, timestampStr]);
            
            const todayLogs = todayLogsRes.rows[0] as { count: string | number };
            const todayCount = Number(todayLogs.count);

            const isFirstQuestToday = todayCount <= 1;
            const manaBase = isFirstQuestToday ? Math.min(100, user.mana + 30) : user.mana;
            const newMana = Math.max(0, manaBase - 10);

            const todayStr = `${logTime.getFullYear()}-${String(logTime.getMonth() + 1).padStart(2, '0')}-${String(logTime.getDate()).padStart(2, '0')}`;

            await client.query('UPDATE users SET hp = $1, mana = $2, level = $3, exp = $4, last_penalty_date = $5 WHERE id = $6', [
              newHp,
              newMana,
              newLevel,
              newExp,
              todayStr,
              user.id
            ]);
          }
        }

        await client.query('COMMIT');
        res.json({ success: true });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      next(err);
    }
  }
}
