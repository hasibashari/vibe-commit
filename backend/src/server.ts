import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDb } from './db/database.js';
import { ZodError } from 'zod';

import userRoutes from './modules/user/user.routes.js';
import questRoutes from './modules/quest/quest.routes.js';
import logRoutes from './modules/quest/log.routes.js';
import brainDumpRoutes from './modules/brain-dump/brain-dump.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import authRoutes from './modules/auth/auth.routes.js';

// Initialize schema
initDb();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 5173;

  // Trust proxy for secure headers
  app.set('trust proxy', 1);

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    validate: false
  });

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors());

  app.use(morgan('dev', {
    skip: (req) => !req.url.startsWith('/api')
  }));
  app.use(express.json({ limit: '1mb' })); // Reduced from 10mb for security
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use('/api/', apiLimiter);

  // Use Modules
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/goals', questRoutes);
  app.use('/api/logs', logRoutes);
  app.use('/api/brain-dump', brainDumpRoutes);
  app.use('/api/ai', aiRoutes);

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({ error: 'Validation Error', issues: err.issues });
      return;
    }
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VibeCommit server running on http://localhost:${PORT}`);
  });
}

startServer();
