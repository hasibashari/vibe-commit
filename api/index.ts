import app from '../backend/src/app.js';
import { initDb } from '../backend/src/db/database.js';

// Initialize the database schema asynchronously in the background.
// This prevents blocking Vercel's Cold Start function execution.
initDb().catch((err) => {
  console.error('Failed to initialize PostgreSQL database on Vercel:', err);
});

export default app;
