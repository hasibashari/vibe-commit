import db from '../../db/database.js';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

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

const MAX_LEVEL = 100;

function getExpNeededForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, Math.min(level - 1, MAX_LEVEL - 1)));
}

function getCumulativeExp(level: number, exp: number): number {
  const safeLevel = Math.min(level, MAX_LEVEL + 1);
  let sum = 0;
  for (let i = 1; i < safeLevel; i++) {
    sum += getExpNeededForLevel(i);
  }
  return sum + exp;
}

/** Returns today's date as YYYY-MM-DD in the Asia/Jakarta timezone, accounting for sandbox offset. */
function getTodayLocalString(user?: any): string {
  const now = new Date();
  if (user && user.sandbox_date_offset) {
    now.setDate(now.getDate() + user.sandbox_date_offset);
  }
  
  // Format specifically in Asia/Jakarta timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

export class UserService {
  static async getUser(id: string, client?: any) {
    const targetDb = client || db;
    const userRes = await targetDb.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = userRes.rows[0];

    if (!user) {
      const today = new Date().toISOString().split('T')[0];
      await targetDb.query(
        'INSERT INTO users (id, name, title, avatar_color, hp, mana, level, exp, last_penalty_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [id, 'Explorer', 'Novice Operative', 'indigo', 100, 100, 1, 0, today]
      );
      const newUserRes = await targetDb.query('SELECT * FROM users WHERE id = $1', [id]);
      return newUserRes.rows[0];
    }
    
    // State machine: Apply daily rollover
    return this.applyTimeEffects(user, client);
  }

  static async applyTimeEffects(user: any, client?: any) {
    const targetDb = client || db;
    const todayStr = getTodayLocalString(user);

    if (user.last_penalty_date && user.last_penalty_date !== todayStr) {
      const lastDate = new Date(`${user.last_penalty_date}T00:00:00`);
      const todayDate = new Date(`${todayStr}T00:00:00`);

      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        let newHp = user.hp;

        // Calculate shielded days
        let shieldedDays = 0;
        if (user.shield_until) {
          const shieldDate = new Date(user.shield_until);
          const shieldDateStr = `${shieldDate.getFullYear()}-${String(shieldDate.getMonth() + 1).padStart(2, '0')}-${String(shieldDate.getDate()).padStart(2, '0')}`;
          const shieldDateNorm = new Date(`${shieldDateStr}T00:00:00`);

          if (shieldDateNorm > lastDate) {
            const shieldDiff = Math.round(
              (Math.min(todayDate.getTime(), shieldDateNorm.getTime()) - lastDate.getTime())
              / (1000 * 60 * 60 * 24)
            );
            shieldedDays = shieldDiff > 0 ? shieldDiff : 0;
          }

          // Clear expired shield
          if (shieldDate < todayDate) {
            await targetDb.query('UPDATE users SET shield_until = NULL WHERE id = $1', [user.id]);
            user.shield_until = null;
          }
        }

        // Fetch all distinct dates where the user completed at least 1 quest (in Asia/Jakarta timezone)
        const activeLogDaysRes = await targetDb.query(`
          SELECT DISTINCT DATE(ql.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') as log_date
          FROM quest_logs ql
          JOIN goals g ON ql.goal_id = g.id
          WHERE g.user_id = $1
            AND ql.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' >= $2::timestamp
            AND ql.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' < $3::timestamp
        `, [user.id, `${user.last_penalty_date} 00:00:00`, `${todayStr} 00:00:00`]);

        const activeLogDays = activeLogDaysRes.rows.map((row: any) => {
          const rawDate = row.log_date;
          if (rawDate instanceof Date) {
            const y = rawDate.getFullYear();
            const m = String(rawDate.getMonth() + 1).padStart(2, '0');
            const d = String(rawDate.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
          }
          if (typeof rawDate === 'string') {
            return rawDate.split('T')[0];
          }
          return String(rawDate);
        });

        const activeDatesSet = new Set(activeLogDays);

        // Fetch all active goals for the user to determine if they had any active quests on a given day
        const activeGoalsRes = await targetDb.query(`
          SELECT g.id, g.created_at, g.type, g.status,
                 (SELECT MIN(ql.timestamp) FROM quest_logs ql WHERE ql.goal_id = g.id) as completed_at
          FROM goals g
          WHERE g.user_id = $1 AND g.status != 'archived'
        `, [user.id]);

        const activeGoals = activeGoalsRes.rows;

        // Iterate through all calendar days in the gap to count actual inactive days
        let inactiveDaysCount = 0;
        let loopDate = new Date(lastDate);
        while (loopDate < todayDate) {
          const y = loopDate.getFullYear();
          const m = String(loopDate.getMonth() + 1).padStart(2, '0');
          const d = String(loopDate.getDate()).padStart(2, '0');
          const loopDateStr = `${y}-${m}-${d}`;

          if (!activeDatesSet.has(loopDateStr)) {
            // Only count as inactive if the user had at least one active quest created on or before this day
            const hasActiveQuestOnDay = activeGoals.some((goal: any) => {
              const createdDate = new Date(goal.created_at);
              const createdDateStr = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(createdDate.getDate()).padStart(2, '0')}`;
              
              if (goal.type === 'one-off' && goal.status === 'completed' && goal.completed_at) {
                const completedDate = new Date(goal.completed_at);
                const completedDateStr = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`;
                return createdDateStr <= loopDateStr && loopDateStr <= completedDateStr;
              }
              
              return createdDateStr <= loopDateStr;
            });

            if (hasActiveQuestOnDay) {
              inactiveDaysCount++;
            }
          }
          loopDate.setDate(loopDate.getDate() + 1);
        }

        // Penalty is only applied for actual inactive days that were not shielded
        const penaltyDays = Math.max(0, inactiveDaysCount - shieldedDays);
        if (penaltyDays > 0) {
          newHp = Math.max(0, newHp - (penaltyDays * 15));
        }

        // Mana now DECAYS on inactive days rather than resetting to 100.
        const newMana = Math.max(0, user.mana - (penaltyDays * 10));

        await targetDb.query('UPDATE users SET hp = $1, mana = $2, last_penalty_date = $3 WHERE id = $4', [
          newHp,
          newMana,
          todayStr,
          user.id
        ]);

        user.hp = newHp;
        user.mana = newMana;
        user.last_penalty_date = todayStr;
      }
    } else if (!user.last_penalty_date) {
      // Initialise if null
      await targetDb.query('UPDATE users SET last_penalty_date = $1 WHERE id = $2', [todayStr, user.id]);
      user.last_penalty_date = todayStr;
    }
    return user;
  }

  static saveBase64Image(userId: string, fieldName: string, base64Data: string | null | undefined): string | null {
    if (base64Data === undefined) {
      return null;
    }
    
    const uploadsDir = path.join(process.cwd(), 'backend', 'public', 'uploads');
    
    if (!base64Data) {
      const filePattern = `user_${userId}_${fieldName}`;
      try {
        if (fs.existsSync(uploadsDir)) {
          const files = fs.readdirSync(uploadsDir);
          for (const file of files) {
            if (file.startsWith(filePattern)) {
              fs.unlinkSync(path.join(uploadsDir, file));
            }
          }
        }
      } catch (err) {
        console.error(`Failed to delete old image ${filePattern}:`, err);
      }
      return "";
    }

    if (base64Data.startsWith('data:image/')) {
      const match = base64Data.match(/^data:image\/(\w+);base64,/);
      if (!match) {
        throw new Error('Invalid base64 image format');
      }
      
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Content, 'base64');
      
      const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
      const safeFieldName = fieldName.replace(/[^a-zA-Z0-9_-]/g, '');
      const filename = `user_${safeUserId}_${safeFieldName}.${ext}`;
      const filePath = path.join(uploadsDir, filename);

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      fs.writeFileSync(filePath, buffer);
      
      return `/uploads/${filename}`;
    }

    return base64Data;
  }

  static async updateUser(id: string, updates: any) {
    const customMainBgValue = updates.custom_main_bg !== undefined
      ? this.saveBase64Image(id, 'custom_main_bg', updates.custom_main_bg)
      : undefined;

    const customCharBgValue = updates.custom_char_bg !== undefined
      ? this.saveBase64Image(id, 'custom_char_bg', updates.custom_char_bg)
      : undefined;

    await db.query(`
      UPDATE users 
      SET name = COALESCE($1, name), 
          title = COALESCE($2, title),
          avatar_color = COALESCE($3, avatar_color),
          avatar_icon = COALESCE($4, avatar_icon),
          custom_main_bg = COALESCE($5, custom_main_bg),
          custom_char_bg = COALESCE($6, custom_char_bg),
          theme_vibe = COALESCE($7, theme_vibe),
          bgm_theme = COALESCE($8, bgm_theme),
          bgm_muted = COALESCE($9, bgm_muted)
      WHERE id = $10
    `, [
      updates.name ?? null, 
      updates.title ?? null, 
      updates.avatar_color ?? null, 
      updates.avatar_icon ?? null,
      customMainBgValue !== undefined ? customMainBgValue : null, 
      customCharBgValue !== undefined ? customCharBgValue : null, 
      updates.theme_vibe ?? null, 
      updates.bgm_theme ?? null, 
      updates.bgm_muted ?? null, 
      id
    ]);
    return this.getUser(id);
  }

  static async buyItem(userId: string, itemId: string) {
    if (!(itemId in ITEM_PRICES)) {
      throw new Error('Invalid item');
    }
    const cost = ITEM_PRICES[itemId];
    
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const userRes = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = userRes.rows[0] as any;
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
        const lastPenaltyDate = user.last_penalty_date || getTodayLocalString(user);
        const shieldStart = new Date(`${lastPenaltyDate}T00:00:00`);
        const shieldUntil = new Date(shieldStart);
        shieldUntil.setDate(shieldUntil.getDate() + 1);
        shieldUntil.setHours(23, 59, 59, 999);

        await client.query('UPDATE users SET shield_until = $1, spent_coins = spent_coins + $2 WHERE id = $3', [
          shieldUntil.toISOString(),
          cost,
          userId
        ]);
        await client.query('COMMIT');
        return await this.getUser(userId); 
      } else if (itemId.startsWith('aesthetic_')) {
        if (newUnlockedItems.includes(itemId)) {
          throw new Error('Item already owned');
        }
        newUnlockedItems.push(itemId);
      } else {
        throw new Error('Invalid item');
      }

      const stmtStr = itemId.startsWith('aesthetic_') 
        ? `UPDATE users SET hp = $1, mana = $2, spent_coins = spent_coins + $3, unlocked_items = $4 WHERE id = $5`
        : `UPDATE users SET hp = $1, mana = $2, spent_coins = spent_coins + $3 WHERE id = $4`;
      
      if (itemId.startsWith('aesthetic_')) {
        await client.query(stmtStr, [newHp, newMana, cost, JSON.stringify(newUnlockedItems), userId]);
      } else {
        await client.query(stmtStr, [newHp, newMana, cost, userId]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    return this.getUser(userId);
  }

  static async sandboxUpdate(userId: string, payload: { hp?: number; mana?: number; level?: number; coins_delta?: number; sandbox_date_offset?: number }) {
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];
    if (!user) throw new Error('User not found');
    
    let queryArgs: any[] = [];
    let setClauses = [];
    let paramCount = 1;
    
    if (payload.hp !== undefined && payload.hp !== null) {
      setClauses.push(`hp = $${paramCount++}`);
      queryArgs.push(payload.hp);
    }
    if (payload.mana !== undefined && payload.mana !== null) {
      setClauses.push(`mana = $${paramCount++}`);
      queryArgs.push(payload.mana);
    }
    if (payload.level !== undefined && payload.level !== null) {
      setClauses.push(`level = $${paramCount++}`);
      queryArgs.push(payload.level);
    }
    if (payload.coins_delta !== undefined && payload.coins_delta !== null) {
      setClauses.push(`spent_coins = spent_coins - $${paramCount++}`); 
      queryArgs.push(payload.coins_delta);
    }
    if (payload.sandbox_date_offset !== undefined && payload.sandbox_date_offset !== null) {
      setClauses.push(`sandbox_date_offset = $${paramCount++}`);
      queryArgs.push(payload.sandbox_date_offset);

      if (payload.sandbox_date_offset === 0) {
        setClauses.push(`last_penalty_date = $${paramCount++}`);
        const now = new Date();
        const realToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        queryArgs.push(realToday);
      }
    }
    
    if (setClauses.length > 0) {
      queryArgs.push(userId);
      await db.query(`UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramCount}`, queryArgs);
    }
    return this.getUser(userId);
  }

  static async resetUser(userId: string) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM quest_logs WHERE goal_id IN (SELECT id FROM goals WHERE user_id = $1)', [userId]);
      await client.query('DELETE FROM goals WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM brain_dumps WHERE user_id = $1', [userId]);
      await client.query(`UPDATE users SET hp = 100, mana = 100, level = 1, exp = 0, spent_coins = 0, unlocked_items = '[]', shield_until = NULL WHERE id = $1`, [userId]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async deleteAccount(userId: string) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM quest_logs WHERE goal_id IN (SELECT id FROM goals WHERE user_id = $1)', [userId]);
      await client.query('DELETE FROM goals WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM brain_dumps WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      await client.query('DELETE FROM accounts WHERE id = $1', [userId]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async importData(userId: string, data: { user?: any, goals?: any[] }) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM quest_logs WHERE goal_id IN (SELECT id FROM goals WHERE user_id = $1)', [userId]);
      await client.query('DELETE FROM goals WHERE user_id = $1', [userId]);

      if (data.user) {
        const todayStr = new Date().toISOString().split('T')[0];
        const importedHp = data.user.hp !== undefined && data.user.hp !== null ? Math.min(100, Math.max(0, data.user.hp)) : null;
        const importedMana = data.user.mana !== undefined && data.user.mana !== null ? Math.min(100, Math.max(0, data.user.mana)) : null;
        
        let importedUnlockedItems = null;
        if (data.user.unlocked_items !== undefined && data.user.unlocked_items !== null) {
          importedUnlockedItems = typeof data.user.unlocked_items === 'string'
            ? data.user.unlocked_items
            : JSON.stringify(data.user.unlocked_items);
        }

        await client.query(`
          UPDATE users 
          SET name = COALESCE($1, name), 
              title = COALESCE($2, title),
              avatar_color = COALESCE($3, avatar_color),
              custom_main_bg = COALESCE($4, custom_main_bg),
              custom_char_bg = COALESCE($5, custom_char_bg),
              theme_vibe = COALESCE($6, theme_vibe),
              bgm_theme = COALESCE($7, bgm_theme),
              bgm_muted = COALESCE($8, bgm_muted),
              hp = COALESCE($9, hp),
              mana = COALESCE($10, mana),
              level = COALESCE($11, level),
              exp = COALESCE($12, exp),
              spent_coins = COALESCE($13, spent_coins),
              unlocked_items = COALESCE($14, unlocked_items),
              shield_until = COALESCE($15, shield_until),
              last_penalty_date = $16
          WHERE id = $17
        `, [
          data.user.name ?? null, 
          data.user.title ?? null, 
          data.user.avatar_color ?? null, 
          data.user.custom_main_bg ?? null, 
          data.user.custom_char_bg ?? null, 
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
        ]);
      }

      if (data.goals && Array.isArray(data.goals)) {
        for (const goal of data.goals) {
          await client.query(`
            INSERT INTO goals (id, user_id, title, description, category, difficulty, reward_alpha, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            goal.id, 
            userId, 
            goal.title, 
            goal.description ?? null, 
            goal.category ?? null, 
            goal.difficulty ?? 1.0, 
            goal.reward_alpha ?? 0.5, 
            goal.createdAt || new Date().toISOString()
          ]);

          if (goal.logs && Array.isArray(goal.logs)) {
            for (const log of goal.logs) {
              const logId = log.id || crypto.randomUUID();
              await client.query(`
                INSERT INTO quest_logs (id, goal_id, timestamp)
                VALUES ($1, $2, $3)
              `, [
                logId,
                goal.id,
                log.timestamp || log.completedAt || new Date().toISOString()
               ]);
            }
          }
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
