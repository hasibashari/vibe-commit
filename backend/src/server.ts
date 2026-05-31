import express from 'express';
import app from './app.js';
import { initDb } from './db/database.js';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  // Initialize schema
  await initDb();

  const PORT = Number(process.env.PORT) || 5173;

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        // Caching compiled assets in /assets/ indefinitely since they are hashed and immutable
        if (filePath.includes('/assets/') || filePath.includes('\\assets\\')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        // Avoid browser caching Service Worker and Manifest files so PWA updates correctly
        if (filePath.endsWith('sw.js') || filePath.endsWith('.webmanifest')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        }
        // Force the correct MIME type for webmanifest files
        if (filePath.endsWith('.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json');
        }
      }
    }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VibeCommit server running on http://localhost:${PORT}`);
  });
}

startServer();
