import { Router } from 'express';
import db from '../../db/database.js';

const router = Router();

router.get('/user/:userId', (req, res) => {
  const logs = db.prepare(`
    SELECT quest_logs.* 
    FROM quest_logs 
    JOIN goals ON quest_logs.goal_id = goals.id 
    WHERE goals.user_id = ? 
    ORDER BY quest_logs.timestamp DESC
  `).all(req.params.userId);
  res.json(logs);
});

router.get('/:goalId', (req, res) => {
  const logs = db.prepare('SELECT * FROM quest_logs WHERE goal_id = ? ORDER BY timestamp DESC').all(req.params.goalId);
  res.json(logs);
});

router.post('/', (req, res) => {
  const { id, goalId, vibeScore, notes } = req.body;
  db.prepare('INSERT INTO quest_logs (id, goal_id, vibe_score, notes) VALUES (?, ?, ?, ?)').run(id, goalId, vibeScore, notes);
  res.json({ success: true });
});

export default router;
