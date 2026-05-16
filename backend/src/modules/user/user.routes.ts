import { Router } from 'express';
import { z } from 'zod';
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

router.put('/:id', (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().optional(),
      title: z.string().optional(),
      avatar_color: z.string().optional(),
      custom_main_bg: z.string().nullable().optional(),
      custom_char_bg: z.string().nullable().optional(),
      custom_character: z.string().nullable().optional(),
      theme_vibe: z.string().optional(),
      bgm_theme: z.string().optional(),
      bgm_muted: z.number().int().optional()
    });
    const parsed = schema.parse(req.body);
    const stmt = db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name), 
          title = COALESCE(?, title),
          avatar_color = COALESCE(?, avatar_color),
          custom_main_bg = COALESCE(?, custom_main_bg),
          custom_char_bg = COALESCE(?, custom_char_bg),
          custom_character = COALESCE(?, custom_character),
          theme_vibe = COALESCE(?, theme_vibe),
          bgm_theme = COALESCE(?, bgm_theme),
          bgm_muted = COALESCE(?, bgm_muted)
      WHERE id = ?
    `);
    stmt.run(
      parsed.name ?? null, 
      parsed.title ?? null, 
      parsed.avatar_color ?? null, 
      parsed.custom_main_bg ?? null, 
      parsed.custom_char_bg ?? null, 
      parsed.custom_character ?? null, 
      parsed.theme_vibe ?? null, 
      parsed.bgm_theme ?? null, 
      parsed.bgm_muted ?? null, 
      req.params.id
    );
    res.json(db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id));
  } catch (err) {
    next(err);
  }
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

router.post('/:id/import', (req, res, next) => {
  try {
    const importSchema = z.object({
      user: z.object({
        name: z.string().optional().nullable(),
        title: z.string().optional().nullable(),
        avatar_color: z.string().optional().nullable(),
        custom_main_bg: z.string().optional().nullable(),
        custom_char_bg: z.string().optional().nullable(),
        custom_character: z.string().optional().nullable(),
        theme_vibe: z.string().optional().nullable(),
        bgm_theme: z.string().optional().nullable(),
        bgm_muted: z.number().int().optional().nullable(),
        hp: z.coerce.number().optional().nullable(),
        mana: z.coerce.number().optional().nullable(),
        level: z.coerce.number().optional().nullable(),
        exp: z.coerce.number().optional().nullable(),
      }).optional().nullable(),
      goals: z.array(z.any()).optional().nullable()
    });
    
    const { user, goals } = importSchema.parse(req.body);
    const userId = req.params.id;

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
              custom_main_bg = COALESCE(?, custom_main_bg),
              custom_char_bg = COALESCE(?, custom_char_bg),
              custom_character = COALESCE(?, custom_character),
              theme_vibe = COALESCE(?, theme_vibe),
              bgm_theme = COALESCE(?, bgm_theme),
              bgm_muted = COALESCE(?, bgm_muted),
              hp = COALESCE(?, hp),
              mana = COALESCE(?, mana),
              level = COALESCE(?, level),
              exp = COALESCE(?, exp)
          WHERE id = ?
        `);
        stmt.run(
          user.name ?? null, 
          user.title ?? null, 
          user.avatar_color ?? null, 
          user.custom_main_bg ?? null, 
          user.custom_char_bg ?? null, 
          user.custom_character ?? null, 
          user.theme_vibe ?? null, 
          user.bgm_theme ?? null, 
          user.bgm_muted ?? null, 
          user.hp ?? null, 
          user.mana ?? null, 
          user.level ?? null, 
          user.exp ?? null, 
          userId
        );
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
            goal.description ?? null, 
            goal.category ?? null, 
            goal.difficulty ?? 1.0, 
            goal.reward_alpha ?? 0.5, 
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

    importData();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
