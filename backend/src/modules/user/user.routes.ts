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

router.post('/:id/import', (req, res) => {
  const userId = req.params.id;
  const { user, goals } = req.body;

  const importData = db.transaction(() => {
    // Delete existing data
    db.prepare('DELETE FROM quest_logs WHERE goal_id IN (SELECT id FROM goals WHERE user_id = ?)').run(userId);
    db.prepare('DELETE FROM goals WHERE user_id = ?').run(userId);

    // Update user stats
    if (user) {
      const stmt = db.prepare(`
        UPDATE users 
        SET name = COALESCE(?, name), 
            title = COALESCE(?, title),
            avatar_color = COALESCE(?, avatar_color),
            hp = COALESCE(?, hp),
            mana = COALESCE(?, mana),
            level = COALESCE(?, level),
            exp = COALESCE(?, exp)
        WHERE id = ?
      `);
      stmt.run(user.name, user.title, user.avatar_color, user.hp, user.mana, user.level, user.exp, userId);
    }

    // Insert goals
    if (goals && Array.isArray(goals)) {
      const insertGoal = db.prepare(`
        INSERT INTO goals (id, user_id, title, description, category, difficulty, reward_alpha, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertLog = db.prepare(`
        INSERT INTO quest_logs (id, goal_id, timestamp)
        VALUES (?, ?, ?)
      `);
      
      const crypto = require('crypto');

      for (const goal of goals) {
        insertGoal.run(
          goal.id, 
          userId, 
          goal.title, 
          goal.description, 
          goal.category, 
          goal.difficulty, 
          goal.reward_alpha, 
          goal.createdAt || new Date().toISOString()
        );

        if (goal.logs && Array.isArray(goal.logs)) {
          for (const log of goal.logs) {
            const logId = log.id || crypto.randomUUID();
            insertLog.run(
              logId,
              goal.id,
              log.timestamp || log.completedAt || new Date().toISOString()
            );
          }
        }
      }
    }
  });

  try {
    importData();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

export default router;
