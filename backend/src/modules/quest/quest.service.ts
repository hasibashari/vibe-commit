import db from '../../db/database.js';

export class QuestService {
  static getGoalsForUser(userId: string) {
    // Embed repetition_count directly so the frontend never needs to recount.
    // Using COALESCE so goals with zero logs still return 0 (not NULL).
    return db.prepare(`
      SELECT g.*, COALESCE(lc.cnt, 0) AS repetition_count
      FROM goals g
      LEFT JOIN (
        SELECT goal_id, COUNT(*) AS cnt
        FROM quest_logs
        GROUP BY goal_id
      ) lc ON lc.goal_id = g.id
      WHERE g.user_id = ?
      ORDER BY g.created_at ASC
    `).all(userId);
  }

  static createGoal(data: { id: string; userId: string; title: string; description?: string | null; difficulty: number; rewardAlpha: number; category?: string | null }) {
    db.prepare(`
      INSERT INTO goals (id, user_id, title, description, difficulty, reward_alpha, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(data.id, data.userId, data.title, data.description ?? null, data.difficulty, data.rewardAlpha, data.category ?? null);
    return { success: true };
  }

  static updateGoal(id: string, data: { title: string; description?: string | null; difficulty: number; rewardAlpha: number; category?: string | null }) {
    db.prepare(`
      UPDATE goals 
      SET title = ?, description = ?, difficulty = ?, reward_alpha = ?, category = ?
      WHERE id = ?
    `).run(data.title, data.description ?? null, data.difficulty, data.rewardAlpha, data.category ?? null, id);
    return { success: true };
  }

  static deleteGoal(id: string) {
    const deleteLogs = db.prepare('DELETE FROM quest_logs WHERE goal_id = ?');
    const deleteGoal = db.prepare('DELETE FROM goals WHERE id = ?');
    
    db.transaction(() => {
      deleteLogs.run(id);
      deleteGoal.run(id);
    })();
    return { success: true };
  }

  static updateDifficulty(id: string, difficulty: number) {
    db.prepare('UPDATE goals SET difficulty = ? WHERE id = ?').run(difficulty, id);
    return { success: true };
  }
}
