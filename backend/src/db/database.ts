import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in environmental variables!');
}

const db = new Pool({
  connectionString,
  ssl: connectionString?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

export async function initDb() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name VARCHAR(255),
        title VARCHAR(255) DEFAULT 'Novice Operative',
        avatar_color VARCHAR(50) DEFAULT 'indigo',
        hp REAL DEFAULT 100,
        mana REAL DEFAULT 100,
        level INTEGER DEFAULT 1,
        exp INTEGER DEFAULT 0,
        custom_main_bg TEXT,
        custom_char_bg TEXT,
        custom_character TEXT,
        theme_vibe VARCHAR(50) DEFAULT 'midnight',
        bgm_theme VARCHAR(50) DEFAULT 'nature',
        bgm_muted INTEGER DEFAULT 0,
        spent_coins INTEGER DEFAULT 0,
        last_penalty_date VARCHAR(50) DEFAULT null,
        shield_until VARCHAR(100) DEFAULT null,
        unlocked_items TEXT DEFAULT '[]',
        avatar_icon VARCHAR(50) DEFAULT 'shield',
        sandbox_date_offset INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        difficulty REAL DEFAULT 1.0,
        reward_alpha REAL DEFAULT 0.5,
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quest_logs (
        id TEXT PRIMARY KEY,
        goal_id TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        vibe_score INTEGER,
        notes TEXT,
        FOREIGN KEY(goal_id) REFERENCES goals(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS brain_dumps (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        raw_content TEXT,
        analysis JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('PostgreSQL database initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize PostgreSQL database:', err);
    throw err;
  }
}

export default db;
