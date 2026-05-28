import db from '../../db/database.js';

export class QuestService {
  static async getGoalsForUser(userId: string) {
    // Embed repetition_count directly so the frontend never needs to recount.
    // Using COALESCE so goals with zero logs still return 0 (not NULL).
    const res = await db.query(`
      SELECT g.*, COALESCE(lc.cnt, 0)::integer AS repetition_count
      FROM goals g
      LEFT JOIN (
        SELECT goal_id, COUNT(*) AS cnt
        FROM quest_logs
        GROUP BY goal_id
      ) lc ON lc.goal_id = g.id
      WHERE g.user_id = $1
      ORDER BY g.created_at ASC
    `, [userId]);
    return res.rows;
  }

  static async createGoal(data: { id: string; userId: string; title: string; description?: string | null; difficulty: number; rewardAlpha: number; category?: string | null }) {
    await db.query(`
      INSERT INTO goals (id, user_id, title, description, difficulty, reward_alpha, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      data.id,
      data.userId,
      data.title,
      data.description ?? null,
      data.difficulty,
      data.rewardAlpha,
      data.category ?? null
    ]);
    return { success: true };
  }

  static async updateGoal(id: string, data: { title: string; description?: string | null; difficulty: number; rewardAlpha: number; category?: string | null }) {
    await db.query(`
      UPDATE goals 
      SET title = $1, description = $2, difficulty = $3, reward_alpha = $4, category = $5
      WHERE id = $6
    `, [
      data.title,
      data.description ?? null,
      data.difficulty,
      data.rewardAlpha,
      data.category ?? null,
      id
    ]);
    return { success: true };
  }

  static async deleteGoal(id: string) {
    await db.query("UPDATE goals SET status = 'archived' WHERE id = $1", [id]);
    return { success: true };
  }

  static async updateDifficulty(id: string, difficulty: number) {
    await db.query('UPDATE goals SET difficulty = $1 WHERE id = $2', [difficulty, id]);
    return { success: true };
  }
}
