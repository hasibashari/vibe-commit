import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { QuestService } from './quest.service.js';

export class QuestController {
  static getGoalsForUser(req: Request, res: Response, next: NextFunction) {
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
      res.json(QuestService.createGoal(parsed));
    } catch (err) {
      next(err);
    }
  }

  static updateGoal(req: Request, res: Response, next: NextFunction) {
    try {
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
      res.json(QuestService.deleteGoal(req.params.id));
    } catch (error) {
      next(error);
    }
  }

  static updateDifficulty(req: Request, res: Response, next: NextFunction) {
    try {
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
