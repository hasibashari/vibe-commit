import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { QuestService } from './quest.service.js';
import db from '../../db/database.js';

export class QuestController {
  static getGoalsForUser(req: Request, res: Response, next: NextFunction) {
    if (req.params.userId !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user quests' });
      return;
    }
    try {
      res.json(QuestService.getGoalsForUser(req.params.userId));
    } catch (err) {
      next(err);
    }
  }

  static createGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        description: z.string().nullable().optional(),
        difficulty: z.coerce.number().default(1.0),
        rewardAlpha: z.coerce.number().default(0.5),
        category: z.string().nullable().optional()
      });
      const parsed = schema.parse(req.body);
      
      if (parsed.userId !== (req as any).user?.id) {
        res.status(403).json({ error: 'Forbidden: Access denied to create quest for other user' });
        return;
      }
      
      res.json(QuestService.createGoal(parsed));
    } catch (err) {
      next(err);
    }
  }

  static updateGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = db.prepare('SELECT user_id FROM goals WHERE id = ?').get(req.params.id) as { user_id: string } | undefined;
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
        category: z.string().nullable().optional()
      });
      const parsed = schema.parse(req.body);
      res.json(QuestService.updateGoal(req.params.id, parsed));
    } catch (err) {
      next(err);
    }
  }

  static deleteGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = db.prepare('SELECT user_id FROM goals WHERE id = ?').get(req.params.id) as { user_id: string } | undefined;
      if (!goal) {
        res.status(404).json({ error: 'Quest not found' });
        return;
      }
      if (goal.user_id !== (req as any).user?.id) {
        res.status(403).json({ error: 'Forbidden: Access denied to other user quest' });
        return;
      }

      res.json(QuestService.deleteGoal(req.params.id));
    } catch (error) {
      next(error);
    }
  }

  static updateDifficulty(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = db.prepare('SELECT user_id FROM goals WHERE id = ?').get(req.params.id) as { user_id: string } | undefined;
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
      res.json(QuestService.updateDifficulty(req.params.id, difficulty));
    } catch (err) {
      next(err);
    }
  }
}
