import { Router } from 'express';
import db from '../../db/database.js';

const router = Router();

router.get('/:userId', (req, res) => {
  const dumps = db.prepare('SELECT * FROM brain_dumps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').all(req.params.userId);
  res.json(dumps);
});

router.post('/', (req, res) => {
  const { id, userId, rawContent, analysis } = req.body;
  db.prepare('INSERT INTO brain_dumps (id, user_id, raw_content, analysis) VALUES (?, ?, ?, ?)').run(id, userId, rawContent, JSON.stringify(analysis));
  res.json({ success: true });
});

export default router;
