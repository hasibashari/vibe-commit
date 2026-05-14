import { Router } from 'express';
import db from '../../db/database.js';

const router = Router();

router.get('/:userId', (req, res) => {
  const goals = db.prepare('SELECT * FROM goals WHERE user_id = ?').all(req.params.userId);
  res.json(goals);
});

router.post('/', (req, res) => {
  const { id, userId, title, description, difficulty, rewardAlpha, parentId, isExperimental, category } = req.body;
  db.prepare(`
    INSERT INTO goals (id, user_id, title, description, difficulty, reward_alpha, parent_id, is_experimental, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title, description, difficulty, rewardAlpha, parentId, isExperimental ? 1 : 0, category);
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
    // Perform cascading delete (deep first)
    const getDescendants = (parentId: string): string[] => {
      const childrenRes = db.prepare('SELECT id FROM goals WHERE parent_id = ?').all(parentId) as { id: string }[];
      let allDescendants: string[] = [];
      for (const child of childrenRes) {
        allDescendants.push(...getDescendants(child.id), child.id);
      }
      return allDescendants;
    };
    
    const idsToDelete = [...getDescendants(id), id];
    
    const deleteLogs = db.prepare('DELETE FROM quest_logs WHERE goal_id = ?');
    const deleteGoal = db.prepare('DELETE FROM goals WHERE id = ?');
    
    const transaction = db.transaction(() => {
      for (const targetId of idsToDelete) {
        deleteLogs.run(targetId);
        deleteGoal.run(targetId);
      }
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
