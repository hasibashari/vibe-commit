import db from '../../db/database.js';

export class QuestService {
  static async getGoalsForUser(userId: string) {
    // Embed repetition_count directly so the frontend never needs to recount.
    // Using COALESCE so goals with zero logs still return 0 (not NULL).
    // Filter logic:
    // Return all 'active' goals.
    // Also return 'completed' goals (one-off) ONLY if they have at least one log created TODAY
    // so they stay crossed-out on the UI until midnight.
    const res = await db.query(`
      SELECT g.*, COALESCE(lc.cnt, 0)::integer AS repetition_count
      FROM goals g
      LEFT JOIN (
        SELECT goal_id, COUNT(*) AS cnt
        FROM quest_logs
        GROUP BY goal_id
      ) lc ON lc.goal_id = g.id
      WHERE g.user_id = $1 
        AND g.status != 'archived'
        AND (
          g.status = 'active'
          OR (
            g.status = 'completed' 
            AND EXISTS (
              SELECT 1 FROM quest_logs 
              WHERE quest_logs.goal_id = g.id 
                AND DATE(quest_logs.timestamp) = CURRENT_DATE + (
                  COALESCE((SELECT sandbox_date_offset FROM users WHERE id = $1), 0) * INTERVAL '1 day'
                )
            )
          )
        )
      ORDER BY g.created_at ASC
    `, [userId]);
    return res.rows;
  }

  static async createGoal(data: { id: string; userId: string; title: string; description?: string | null; difficulty: number; rewardAlpha: number; category?: string | null; type?: 'daily' | 'one-off' }) {
    await db.query(`
      INSERT INTO goals (id, user_id, title, description, difficulty, reward_alpha, category, type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      data.id,
      data.userId,
      data.title,
      data.description ?? null,
      data.difficulty,
      data.rewardAlpha,
      data.category ?? null,
      data.type ?? 'daily'
    ]);
    return { success: true };
  }

  static async updateGoal(id: string, data: { title: string; description?: string | null; difficulty: number; rewardAlpha: number; category?: string | null; type?: 'daily' | 'one-off' }) {
    await db.query(`
      UPDATE goals 
      SET title = $1, description = $2, difficulty = $3, reward_alpha = $4, category = $5, type = $6
      WHERE id = $7
    `, [
      data.title,
      data.description ?? null,
      data.difficulty,
      data.rewardAlpha,
      data.category ?? null,
      data.type ?? 'daily',
      id
    ]);
    return { success: true };
  }

  static async deleteGoal(id: string) {
    const logsRes = await db.query('SELECT COUNT(*) FROM quest_logs WHERE goal_id = $1', [id]);
    const logCount = parseInt(logsRes.rows[0].count, 10);

    if (logCount === 0) {
      await db.query('DELETE FROM goals WHERE id = $1', [id]);
    } else {
      await db.query("UPDATE goals SET status = 'archived' WHERE id = $1", [id]);
    }
    return { success: true };
  }

  static async updateDifficulty(id: string, difficulty: number) {
    await db.query('UPDATE goals SET difficulty = $1 WHERE id = $2', [difficulty, id]);
    return { success: true };
  }
}
