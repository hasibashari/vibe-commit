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
        db.prepare('INSERT INTO quest_logs (id, goal_id, vibe_score, notes) VALUES (?, ?, ?, ?)').run(
          id, 
          goalId, 
          vibeScore ?? null, 
          notes ?? null
        );

        // Fetch user associated with this goal
        const goalData: any = db.prepare('SELECT user_id, difficulty, reward_alpha FROM goals WHERE id = ?').get(goalId);
        if (goalData) {
          const user: any = db.prepare('SELECT id, hp, mana, level, exp, last_penalty_date FROM users WHERE id = ?').get(goalData.user_id);
          if (user) {
            const expGain = Math.floor(10 * (goalData.difficulty || 1.0) * (goalData.reward_alpha || 0.5));
            let newExp = user.exp + expGain;
            let newLevel = user.level;
            
            const getExpNeeded = (lvl: number) => Math.floor(100 * Math.pow(1.2, lvl - 1));
            let expNeeded = getExpNeeded(newLevel);
            while (newExp >= expNeeded) {
              newExp -= expNeeded;
              newLevel += 1;
              expNeeded = getExpNeeded(newLevel);
            }

            // Completing a request restores some HP (e.g., +5) up to 100
            const newHp = Math.min(100, user.hp + 5);
            
            // Completing a task costs some Mana (Focus) - representing effort
            // Don't let it drop below 0
            const newMana = Math.max(0, user.mana - 10);
            
            const todayStr = new Date().toISOString().split('T')[0];

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
