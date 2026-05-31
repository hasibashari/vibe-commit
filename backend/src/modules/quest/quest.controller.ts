import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { QuestService } from './quest.service.js';
import db from '../../db/database.js';

export class QuestController {
  static async getGoalsForUser(req: Request, res: Response, next: NextFunction) {
    if (req.params.userId !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user quests' });
      return;
    }
    try {
      const goals = await QuestService.getGoalsForUser(req.params.userId);
      res.json(goals);
    } catch (err) {
      next(err);
    }
  }

  static async createGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        description: z.string().nullable().optional(),
        difficulty: z.coerce.number().default(1.0),
        rewardAlpha: z.coerce.number().default(0.5),
        category: z.string().nullable().optional(),
        type: z.enum(['daily', 'one-off']).default('daily')
      });
      const parsed = schema.parse(req.body);
      
      if (parsed.userId !== (req as any).user?.id) {
        res.status(403).json({ error: 'Forbidden: Access denied to create quest for other user' });
        return;
      }
      
      const result = await QuestService.createGoal(parsed);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async updateGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goalRes = await db.query('SELECT user_id FROM goals WHERE id = $1', [req.params.id]);
      const goal = goalRes.rows[0] as { user_id: string } | undefined;
      if (!goal) {
        res.status(404).json({ error: 'Quest not found' });
        return;
      }
      if (goal.user_id !== (req as any).user?.id) {
        res.status(403).json({ error: 'Forbidden: Access denied to other user quest' });
        return;
      }

      const schema = z.object({
        title: z.string(),
        description: z.string().nullable().optional(),
        difficulty: z.coerce.number().default(1.0),
        rewardAlpha: z.coerce.number().default(0.5),
        category: z.string().nullable().optional(),
        type: z.enum(['daily', 'one-off']).default('daily')
      });
      const parsed = schema.parse(req.body);
      const result = await QuestService.updateGoal(req.params.id, parsed);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async deleteGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goalRes = await db.query('SELECT user_id FROM goals WHERE id = $1', [req.params.id]);
      const goal = goalRes.rows[0] as { user_id: string } | undefined;
      if (!goal) {
        res.status(404).json({ error: 'Quest not found' });
        return;
      }
      if (goal.user_id !== (req as any).user?.id) {
        res.status(403).json({ error: 'Forbidden: Access denied to other user quest' });
        return;
      }

      const result = await QuestService.deleteGoal(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateDifficulty(req: Request, res: Response, next: NextFunction) {
    try {
      const goalRes = await db.query('SELECT user_id FROM goals WHERE id = $1', [req.params.id]);
      const goal = goalRes.rows[0] as { user_id: string } | undefined;
      if (!goal) {
        res.status(404).json({ error: 'Quest not found' });
        return;
      }
      if (goal.user_id !== (req as any).user?.id) {
        res.status(403).json({ error: 'Forbidden: Access denied to other user quest' });
        return;
      }

      const schema = z.object({
        difficulty: z.coerce.number()
      });
      const { difficulty } = schema.parse(req.body);
      const result = await QuestService.updateDifficulty(req.params.id, difficulty);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
