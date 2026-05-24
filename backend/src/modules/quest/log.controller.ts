import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import db from '../../db/database.js';

export class LogController {
  static getLogsForUser(req: Request, res: Response, next: NextFunction) {
    if (req.params.userId !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user logs' });
      return;
    }
    try {
      const logs = db.prepare(`
        SELECT quest_logs.* 
        FROM quest_logs 
        JOIN goals ON quest_logs.goal_id = goals.id 
        WHERE goals.user_id = ? 
        ORDER BY quest_logs.timestamp DESC
      `).all(req.params.userId);
      res.json(logs);
    } catch (err) {
      next(err);
    }
  }

  static getLogsForGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = db.prepare('SELECT user_id FROM goals WHERE id = ?').get(req.params.goalId) as { user_id: string } | undefined;
      if (!goal) {
        res.status(404).json({ error: 'Quest not found' });
        return;
      }
      if (goal.user_id !== (req as any).user?.id) {
        res.status(403).json({ error: 'Forbidden: Access denied to other user quest logs' });
        return;
      }

      const logs = db.prepare('SELECT * FROM quest_logs WHERE goal_id = ? ORDER BY timestamp DESC').all(req.params.goalId);
      res.json(logs);
    } catch (err) {
      next(err);
    }
  }

  static createLog(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        id: z.string(),
        goalId: z.string(),
        vibeScore: z.number().nullable().optional(),
        notes: z.string().nullable().optional()
      });
      const { id, goalId, vibeScore, notes } = schema.parse(req.body);
      
      const goal = db.prepare('SELECT user_id FROM goals WHERE id = ?').get(goalId) as { user_id: string } | undefined;
      if (!goal) {
        res.status(404).json({ error: 'Quest not found for this log' });
        return;
      }
      if (goal.user_id !== (req as any).user?.id) {
        res.status(403).json({ error: 'Forbidden: Access denied to create log for other user quest' });
        return;
      }

      db.transaction(() => {
        // Fetch user's date offset to determine quest log's simulated timestamp
        const userOffsetObj = db.prepare('SELECT sandbox_date_offset FROM users WHERE id = ?').get(goal.user_id) as { sandbox_date_offset: number } | undefined;
        const offset = userOffsetObj?.sandbox_date_offset || 0;

        // Calculate simulated timestamp
        const logTime = new Date();
        if (offset !== 0) {
          logTime.setDate(logTime.getDate() + offset);
        }
        const timestampStr = logTime.toISOString().replace('T', ' ').substring(0, 19); // SQLite friendly space format

        // INSERT OR IGNORE makes this idempotent — replayed offline logIds
        // (same UUID sent again during sync) are silently skipped instead of
        // crashing with a UNIQUE constraint error and discarding the action.
        const insertResult = db.prepare(
          'INSERT OR IGNORE INTO quest_logs (id, goal_id, vibe_score, notes, timestamp) VALUES (?, ?, ?, ?, ?)'
        ).run(id, goalId, vibeScore ?? null, notes ?? null, timestampStr);

        // If 0 rows were changed the log already existed — skip reward grant
        // to avoid double-crediting EXP/HP on duplicate requests.
        if (insertResult.changes === 0) return;

        // Fetch user associated with this goal
        const goalData: any = db.prepare('SELECT user_id, difficulty, reward_alpha FROM goals WHERE id = ?').get(goalId);
        if (goalData) {
          const user: any = db.prepare('SELECT id, hp, mana, level, exp, last_penalty_date FROM users WHERE id = ?').get(goalData.user_id);
          if (user) {
            const expGain = Math.floor(10 * (goalData.difficulty || 1.0) * (goalData.reward_alpha || 0.5));
            let newExp = user.exp + expGain;
            let newLevel = user.level;

            // Cap level to prevent IEEE 754 precision loss above ~level 200
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

            // Mana represents daily focus. On the FIRST quest of a new day
            // mana refreshes to 100 (new day, fresh focus); each subsequent
            // quest drains 10 points (effort spent).
            //
            // OBJECTIVE COUNTER: Instead of relying on user.last_penalty_date (which is subject
            // to race conditions when page loads applyTimeEffects first), we query SQLite to check
            // how many quest logs the user has completed today (in local server time).
            // Since the transaction has already inserted the current log, a count of <= 1 indicates
            // this is the very first quest completion of today.
            const todayLogs = db.prepare(`
              SELECT COUNT(*) as count 
              FROM quest_logs 
              JOIN goals ON quest_logs.goal_id = goals.id 
              WHERE goals.user_id = ? 
                AND DATE(quest_logs.timestamp, 'localtime') = DATE(?, 'localtime')
            `).get(user.id, timestampStr) as { count: number };

            const isFirstQuestToday = todayLogs.count <= 1;
            const manaBase = isFirstQuestToday ? 100 : user.mana;
            const newMana = Math.max(0, manaBase - 10);

            const todayStr = `${logTime.getFullYear()}-${String(logTime.getMonth() + 1).padStart(2, '0')}-${String(logTime.getDate()).padStart(2, '0')}`;

            db.prepare('UPDATE users SET hp = ?, mana = ?, level = ?, exp = ?, last_penalty_date = ? WHERE id = ?')
              .run(newHp, newMana, newLevel, newExp, todayStr, user.id);
          }
        }
      })();
      
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}
