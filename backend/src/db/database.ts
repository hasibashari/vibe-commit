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
  
  const userCols = db.pragma('table_info(users)') as any[];
  const hasUserCol = (name: string) => userCols.some((c) => c.name === name);

  if (!hasUserCol('title')) db.exec("ALTER TABLE users ADD COLUMN title TEXT DEFAULT 'Novice Operative'");
  if (!hasUserCol('avatar_color')) db.exec("ALTER TABLE users ADD COLUMN avatar_color TEXT DEFAULT 'indigo'");
  if (!hasUserCol('custom_main_bg')) db.exec("ALTER TABLE users ADD COLUMN custom_main_bg TEXT");
  if (!hasUserCol('custom_char_bg')) db.exec("ALTER TABLE users ADD COLUMN custom_char_bg TEXT");
  if (!hasUserCol('custom_character')) db.exec("ALTER TABLE users ADD COLUMN custom_character TEXT");
  if (!hasUserCol('theme_vibe')) db.exec("ALTER TABLE users ADD COLUMN theme_vibe TEXT DEFAULT 'midnight'");
  if (!hasUserCol('bgm_theme')) db.exec("ALTER TABLE users ADD COLUMN bgm_theme TEXT DEFAULT 'nature'");
  if (!hasUserCol('bgm_muted')) db.exec("ALTER TABLE users ADD COLUMN bgm_muted INTEGER DEFAULT 0");
  if (!hasUserCol('spent_coins')) db.exec("ALTER TABLE users ADD COLUMN spent_coins INTEGER DEFAULT 0");
  if (!hasUserCol('last_penalty_date')) db.exec("ALTER TABLE users ADD COLUMN last_penalty_date TEXT DEFAULT null");
  if (!hasUserCol('shield_until')) db.exec("ALTER TABLE users ADD COLUMN shield_until TEXT DEFAULT null");
  if (!hasUserCol('unlocked_items')) db.exec("ALTER TABLE users ADD COLUMN unlocked_items TEXT DEFAULT '[]'");
  if (!hasUserCol('avatar_icon')) db.exec("ALTER TABLE users ADD COLUMN avatar_icon TEXT DEFAULT 'shield'");

  const goalCols = db.pragma('table_info(goals)') as any[];
  const hasGoalCol = (name: string) => goalCols.some((c) => c.name === name);

  if (hasGoalCol('is_experimental')) db.exec("ALTER TABLE goals DROP COLUMN is_experimental");
  if (hasGoalCol('parent_id')) db.exec("ALTER TABLE goals DROP COLUMN parent_id");

  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      difficulty REAL DEFAULT 1.0,
      reward_alpha REAL DEFAULT 0.5,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
