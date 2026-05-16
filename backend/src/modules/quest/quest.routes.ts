import { Router } from 'express';
import { z } from 'zod';
import db from '../../db/database.js';

const router = Router();

router.get('/:userId', (req, res) => {
  const goals = db.prepare('SELECT * FROM goals WHERE user_id = ?').all(req.params.userId);
  res.json(goals);
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
    const { id, userId, title, description, difficulty, rewardAlpha, category } = schema.parse(req.body);
    db.prepare(`
      INSERT INTO goals (id, user_id, title, description, difficulty, reward_alpha, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, title, description ?? null, difficulty, rewardAlpha, category ?? null);
    res.json({ success: true });
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
    const { title, description, difficulty, rewardAlpha, category } = schema.parse(req.body);
    db.prepare(`
      UPDATE goals 
      SET title = ?, description = ?, difficulty = ?, reward_alpha = ?, category = ?
      WHERE id = ?
    `).run(title, description ?? null, difficulty, rewardAlpha, category ?? null, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const id = req.params.id;
    
    const deleteLogs = db.prepare('DELETE FROM quest_logs WHERE goal_id = ?');
    const deleteGoal = db.prepare('DELETE FROM goals WHERE id = ?');
    
    const transaction = db.transaction(() => {
      deleteLogs.run(id);
      deleteGoal.run(id);
    });
    
    transaction();
    res.json({ success: true });
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
    db.prepare('UPDATE goals SET difficulty = ? WHERE id = ?').run(difficulty, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
