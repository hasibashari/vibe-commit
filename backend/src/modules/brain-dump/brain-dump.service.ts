import db from '../../db/database.js';

export class BrainDumpService {
  static getLatestDump(userId: string) {
    return db.prepare('SELECT * FROM brain_dumps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').all(userId);
  }

  static createDump(data: { id: string; userId: string; rawContent: string; analysis: any }) {
    db.prepare('INSERT INTO brain_dumps (id, user_id, raw_content, analysis) VALUES (?, ?, ?, ?)').run(
      data.id,
      data.userId,
      data.rawContent,
      JSON.stringify(data.analysis)
    );
    return { success: true };
  }
}
