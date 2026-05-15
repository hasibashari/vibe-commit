import { Router } from 'express';
import db from '../../db/database.js';

const router = Router();

router.get('/:userId', (req, res) => {
  const goals = db.prepare('SELECT * FROM goals WHERE user_id = ?').all(req.params.userId);
  res.json(goals);
});

router.post('/', (req, res) => {
  const { id, userId, title, description, difficulty, rewardAlpha, category } = req.body;
  db.prepare(`
    INSERT INTO goals (id, user_id, title, description, difficulty, reward_alpha, category)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title, description, difficulty, rewardAlpha, category);
  res.json({ success: true });
});

router.put('/:id', (req, res) => {
  const { title, description, difficulty, rewardAlpha, category } = req.body;
  db.prepare(`
    UPDATE goals 
    SET title = ?, description = ?, difficulty = ?, reward_alpha = ?, category = ?
    WHERE id = ?
  `).run(title, description, difficulty, rewardAlpha, category, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
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
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/:id/difficulty', (req, res) => {
  const { difficulty } = req.body;
  db.prepare('UPDATE goals SET difficulty = ? WHERE id = ?').run(difficulty, req.params.id);
  res.json({ success: true });
});

export default router;
