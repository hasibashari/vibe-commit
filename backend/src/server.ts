import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDb } from './db/database.js';

import userRoutes from './modules/user/user.routes.js';
import questRoutes from './modules/quest/quest.routes.js';
import logRoutes from './modules/quest/log.routes.js';
import brainDumpRoutes from './modules/brain-dump/brain-dump.routes.js';

// Initialize schema
initDb();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Use Modules
  app.use('/api/user', userRoutes);
  app.use('/api/goals', questRoutes);
  app.use('/api/logs', logRoutes);
  app.use('/api/brain-dump', brainDumpRoutes);

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VibeCommit server running on http://localhost:${PORT}`);
  });
}

startServer();
