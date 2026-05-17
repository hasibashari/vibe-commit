import { Router } from 'express';
import { z } from 'zod';
import { QuestService } from './quest.service.js';

const router = Router();

router.get('/:userId', (req, res) => {
  res.json(QuestService.getGoalsForUser(req.params.userId));
});

router.post('/', (req, res, next) => {
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
});

router.put('/:id', (req, res, next) => {
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
});

router.delete('/:id', (req, res, next) => {
  try {
    res.json(QuestService.deleteGoal(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/difficulty', (req, res, next) => {
  try {
    const schema = z.object({
      difficulty: z.coerce.number()
    });
    const { difficulty } = schema.parse(req.body);
    res.json(QuestService.updateDifficulty(req.params.id, difficulty));
  } catch (err) {
    next(err);
  }
});

export default router;
