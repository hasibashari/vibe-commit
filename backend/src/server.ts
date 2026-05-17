import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { ZodError } from 'zod';
import { requireAuth } from './middlewares/auth.middleware.js';

import aiRoutes from './modules/ai/ai.routes.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use('/api/', apiLimiter);

  // Use Modules
  app.use('/api/', requireAuth);
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
