import { Router } from 'express';
import db from '../../db/database.js';

const router = Router();

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
