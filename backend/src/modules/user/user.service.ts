import db from '../../db/database.js';
import crypto from 'node:crypto';

const ITEM_PRICES: Record<string, number> = {
  'hp_elixir': 150,
  'mana_tonic': 200,
  'streak_shield': 500,
  'aesthetic_color_cyan': 300,
  'aesthetic_color_rose': 300,
  'aesthetic_theme_matrix': 800,
  'aesthetic_theme_neon': 800,
  'aesthetic_title_vanguard': 1000,
  'aesthetic_title_legendary': 1500,
};

function getExpNeededForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

function getCumulativeExp(level: number, exp: number): number {
  let sum = 0;
  for (let i = 1; i < level; i++) {
    sum += getExpNeededForLevel(i);
  }
  return sum + exp;
}

export class UserService {
  static getUser(id: string) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      db.prepare('INSERT INTO users (id, name, title, avatar_color, hp, mana, level, exp, last_penalty_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, 'Explorer', 'Novice Operative', 'indigo', 100, 100, 1, 0, new Date().toISOString().split('T')[0]);
      return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }
    
    // State machine: Apply daily rollover
    return this.applyTimeEffects(user);
  }

  static applyTimeEffects(user: any) {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todayStr = todayDate.toISOString().split('T')[0];
    
    if (user.last_penalty_date && user.last_penalty_date !== todayStr) {
      const lastDate = new Date(user.last_penalty_date);
      lastDate.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        let newHp = user.hp;
        let newMana = 100; // Mana resets to 100 daily
        
        // Calculate penalty days. Did they have a shield?
        let shieldedDays = 0;
        if (user.shield_until) {
          const shieldDate = new Date(user.shield_until);
          const shieldDateNormalized = new Date(shieldDate);
          shieldDateNormalized.setHours(0, 0, 0, 0);
          
          if (shieldDateNormalized > lastDate) {
            const shieldDiff = Math.floor((Math.min(todayDate.getTime(), shieldDateNormalized.getTime()) - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            shieldedDays = shieldDiff > 0 ? shieldDiff : 0;
          }

          // Clear shield if it has expired relative to today
          if (shieldDate <= todayDate) {
            db.prepare('UPDATE users SET shield_until = NULL WHERE id = ?').run(user.id);
            user.shield_until = null;
          }
        }
        
        const penaltyDays = Math.max(0, diffDays - shieldedDays);
        if (penaltyDays > 0) {
          // Check if they completed any quests on the last_penalty_date 
          // (Actually, if they didn't login for days, they did 0 quests those days)
          newHp = Math.max(0, newHp - (penaltyDays * 15));
        }

        db.prepare('UPDATE users SET hp = ?, mana = ?, last_penalty_date = ? WHERE id = ?')
          .run(newHp, newMana, todayStr, user.id);
          
        user.hp = newHp;
        user.mana = newMana;
        user.last_penalty_date = todayStr;
      }
    } else if (!user.last_penalty_date) {
        // Initialize if null
        db.prepare('UPDATE users SET last_penalty_date = ? WHERE id = ?').run(todayStr, user.id);
        user.last_penalty_date = todayStr;
    }
    return user;
  }

  static updateUser(id: string, updates: any) {
    const stmt = db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name), 
          title = COALESCE(?, title),
          avatar_color = COALESCE(?, avatar_color),
          avatar_icon = COALESCE(?, avatar_icon),
          custom_main_bg = COALESCE(?, custom_main_bg),
          custom_char_bg = COALESCE(?, custom_char_bg),
          custom_character = COALESCE(?, custom_character),
          theme_vibe = COALESCE(?, theme_vibe),
          bgm_theme = COALESCE(?, bgm_theme),
          bgm_muted = COALESCE(?, bgm_muted)
      WHERE id = ?
    `);
    stmt.run(
      updates.name ?? null, 
      updates.title ?? null, 
      updates.avatar_color ?? null, 
      updates.avatar_icon ?? null,
      updates.custom_main_bg ?? null, 
      updates.custom_char_bg ?? null, 
      updates.custom_character ?? null, 
      updates.theme_vibe ?? null, 
      updates.bgm_theme ?? null, 
      updates.bgm_muted ?? null, 
      id
    );
    return this.getUser(id);
  }

  static buyItem(userId: string, itemId: string) {
    if (!(itemId in ITEM_PRICES)) {
      throw new Error('Invalid item');
    }
    const cost = ITEM_PRICES[itemId];
    
    db.transaction(() => {
      const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      if (!user) throw new Error('User not found');
      
      const totalEarned = getCumulativeExp(user.level, user.exp);
      const availableCoins = totalEarned - (user.spent_coins || 0);

      if (availableCoins < cost) {
        throw new Error('Insufficient coins');
      }

      let newHp = user.hp;
      let newMana = user.mana;
      let newUnlockedItems = [];
      try {
        newUnlockedItems = JSON.parse(user.unlocked_items || '[]');
      } catch (e) {
        newUnlockedItems = [];
      }

      if (itemId === 'hp_elixir') {
        newHp = Math.min(100, user.hp + 30);
      } else if (itemId === 'mana_tonic') {
        newMana = Math.min(100, user.mana + 20);
      } else if (itemId === 'streak_shield') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        
        db.prepare('UPDATE users SET shield_until = ?, spent_coins = spent_coins + ? WHERE id = ?')
          .run(tomorrow.toISOString(), cost, userId);
        return; 
      } else if (itemId.startsWith('aesthetic_')) {
        if (newUnlockedItems.includes(itemId)) {
          throw new Error('Item already owned');
        }
        newUnlockedItems.push(itemId);
      } else {
        throw new Error('Invalid item');
      }

      const stmtStr = itemId.startsWith('aesthetic_') 
        ? `UPDATE users SET hp = ?, mana = ?, spent_coins = spent_coins + ?, unlocked_items = ? WHERE id = ?`
        : `UPDATE users SET hp = ?, mana = ?, spent_coins = spent_coins + ? WHERE id = ?`;
      
      const stmt = db.prepare(stmtStr);
      
      if (itemId.startsWith('aesthetic_')) {
        stmt.run(newHp, newMana, cost, JSON.stringify(newUnlockedItems), userId);
      } else {
        stmt.run(newHp, newMana, cost, userId);
      }
    })();
    return this.getUser(userId);
  }

  static sandboxUpdate(userId: string, payload: { hp?: number; mana?: number; level?: number; coins_delta?: number }) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) throw new Error('User not found');
    
    let queryArgs: (number|string)[] = [];
    let setClauses = [];
    
    if (payload.hp !== undefined && payload.hp !== null) {
      setClauses.push('hp = ?');
      queryArgs.push(payload.hp);
    }
    if (payload.mana !== undefined && payload.mana !== null) {
      setClauses.push('mana = ?');
      queryArgs.push(payload.mana);
    }
    if (payload.level !== undefined && payload.level !== null) {
      setClauses.push('level = ?');
      queryArgs.push(payload.level);
    }
    if (payload.coins_delta !== undefined && payload.coins_delta !== null) {
      setClauses.push('spent_coins = spent_coins - ?'); 
      queryArgs.push(payload.coins_delta);
    }
    
    if (setClauses.length > 0) {
      queryArgs.push(userId);
      db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`).run(...queryArgs);
    }
    return this.getUser(userId);
  }

  static resetUser(userId: string) {
    db.transaction(() => {
      db.prepare('DELETE FROM quest_logs WHERE goal_id IN (SELECT id FROM goals WHERE user_id = ?)').run(userId);
      db.prepare('DELETE FROM goals WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM brain_dumps WHERE user_id = ?').run(userId);
      db.prepare('UPDATE users SET hp = 100, mana = 100, level = 1, exp = 0, spent_coins = 0, unlocked_items = \'[]\', shield_until = NULL WHERE id = ?').run(userId);
    })();
  }

  static importData(userId: string, data: { user?: any, goals?: any[] }) {
    db.transaction(() => {
      db.prepare('DELETE FROM quest_logs WHERE goal_id IN (SELECT id FROM goals WHERE user_id = ?)').run(userId);
      db.prepare('DELETE FROM goals WHERE user_id = ?').run(userId);

      if (data.user) {
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
              exp = COALESCE(?, exp),
              spent_coins = COALESCE(?, spent_coins),
              unlocked_items = COALESCE(?, unlocked_items),
              shield_until = COALESCE(?, shield_until),
              last_penalty_date = ?
          WHERE id = ?
        `);
        // We set last_penalty_date to today so imported stats don't immediately decay.
        const todayStr = new Date().toISOString().split('T')[0];

        // Clamp imported HP/Mana defensively to protect game state from corruption or cheats
        const importedHp = data.user.hp !== undefined && data.user.hp !== null ? Math.min(100, Math.max(0, data.user.hp)) : null;
        const importedMana = data.user.mana !== undefined && data.user.mana !== null ? Math.min(100, Math.max(0, data.user.mana)) : null;
        
        // Ensure unlocked_items is stringified if passed as array
        let importedUnlockedItems = null;
        if (data.user.unlocked_items !== undefined && data.user.unlocked_items !== null) {
          importedUnlockedItems = typeof data.user.unlocked_items === 'string'
            ? data.user.unlocked_items
            : JSON.stringify(data.user.unlocked_items);
        }

        stmt.run(
          data.user.name ?? null, 
          data.user.title ?? null, 
          data.user.avatar_color ?? null, 
          data.user.custom_main_bg ?? null, 
          data.user.custom_char_bg ?? null, 
          data.user.custom_character ?? null, 
          data.user.theme_vibe ?? null, 
          data.user.bgm_theme ?? null, 
          data.user.bgm_muted ?? null, 
          importedHp, 
          importedMana, 
          data.user.level ?? null, 
          data.user.exp ?? null, 
          data.user.spent_coins ?? null,
          importedUnlockedItems,
          data.user.shield_until ?? null,
          todayStr,
          userId
        );
      }

      if (data.goals && Array.isArray(data.goals)) {
        const insertGoal = db.prepare(`
          INSERT INTO goals (id, user_id, title, description, category, difficulty, reward_alpha, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertLog = db.prepare(`
          INSERT INTO quest_logs (id, goal_id, timestamp)
          VALUES (?, ?, ?)
        `);

        for (const goal of data.goals) {
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
    })();
  }
}
