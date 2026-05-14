import { Router } from 'express';
import db from '../../db/database.js';

const router = Router();

router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) {
    db.prepare('INSERT INTO users (id, name, title, avatar_color) VALUES (?, ?, ?, ?)').run(req.params.id, 'Explorer', 'Novice Operative', 'indigo');
    return res.json(db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id));
  }
  res.json(user);
});

router.put('/:id', (req, res) => {
  const { name, title, avatar_color } = req.body;
  const stmt = db.prepare(`
    UPDATE users 
    SET name = COALESCE(?, name), 
        title = COALESCE(?, title),
        avatar_color = COALESCE(?, avatar_color)
    WHERE id = ?
  `);
  stmt.run(name, title, avatar_color, req.params.id);
  res.json(db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id));
});

router.post('/:id/reset', (req, res) => {
  const userId = req.params.id;
  // Transaction to delete everything for user
  const dropData = db.transaction(() => {
    // Delete logs
    db.prepare('DELETE FROM quest_logs WHERE goal_id IN (SELECT id FROM goals WHERE user_id = ?)').run(userId);
    // Delete goals
    db.prepare('DELETE FROM goals WHERE user_id = ?').run(userId);
    // Delete brain dumps
    db.prepare('DELETE FROM brain_dumps WHERE user_id = ?').run(userId);
    // Reset User stats
    db.prepare('UPDATE users SET hp = 100, mana = 100, level = 1, exp = 0 WHERE id = ?').run(userId);
  });
  
  dropData();
  res.json({ success: true });
});

export default router;
