import Database from 'better-sqlite3';

const db = new Database('vibe_commit.db');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      title TEXT DEFAULT 'Novice Operative',
      avatar_color TEXT DEFAULT 'indigo',
      hp REAL DEFAULT 100,
      mana REAL DEFAULT 100,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0
    );
  `);
  
  try { db.exec("ALTER TABLE users ADD COLUMN title TEXT DEFAULT 'Novice Operative'"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN avatar_color TEXT DEFAULT 'indigo'"); } catch (e) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      difficulty REAL DEFAULT 1.0,
      reward_alpha REAL DEFAULT 0.5,
      parent_id TEXT,
      is_experimental BOOLEAN DEFAULT 0,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(parent_id) REFERENCES goals(id)
    );

    CREATE TABLE IF NOT EXISTS quest_logs (
      id TEXT PRIMARY KEY,
      goal_id TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      vibe_score INTEGER,
      notes TEXT,
      FOREIGN KEY(goal_id) REFERENCES goals(id)
    );

    CREATE TABLE IF NOT EXISTS brain_dumps (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      raw_content TEXT,
      analysis JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export default db;
