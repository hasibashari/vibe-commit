import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initDb } from './db/database.js';
import { ZodError } from 'zod';

import userRoutes from './modules/user/user.routes.js';
import questRoutes from './modules/quest/quest.routes.js';
import logRoutes from './modules/quest/log.routes.js';
import brainDumpRoutes from './modules/brain-dump/brain-dump.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import authRoutes from './modules/auth/auth.routes.js';

async function startServer() {
  // Initialize schema
  await initDb();

  const app = express();
  const PORT = Number(process.env.PORT) || 5173;

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'backend', 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

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

  // Serve uploaded images statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'public', 'uploads')));

  // Use Modules
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/goals', questRoutes);
  app.use('/api/logs', logRoutes);
  app.use('/api/brain-dump', brainDumpRoutes);
  app.use('/api/ai', aiRoutes);

  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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
