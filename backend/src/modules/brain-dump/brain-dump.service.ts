import db from '../../db/database.js';

export class BrainDumpService {
  static async getLatestDump(userId: string) {
    const res = await db.query('SELECT * FROM brain_dumps WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
    return res.rows;
  }

  static async createDump(data: { id: string; userId: string; rawContent: string; analysis: any }) {
    await db.query('INSERT INTO brain_dumps (id, user_id, raw_content, analysis) VALUES ($1, $2, $3, $4)', [
      data.id,
      data.userId,
      data.rawContent,
      JSON.stringify(data.analysis)
    ]);
    return { success: true };
  }
}
