import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { ZodError } from 'zod';

import userRoutes from './modules/user/user.routes.js';
import questRoutes from './modules/quest/quest.routes.js';
import logRoutes from './modules/quest/log.routes.js';
import authRoutes from './modules/auth/auth.routes.js';

const app = express();

// Ensure uploads directory exists (gracefully ignore read-only file system errors on Vercel serverless)
const uploadsDir = path.join(process.cwd(), 'backend', 'public', 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.warn('Warning: Could not create uploads directory (might be a read-only serverless environment):', err);
}

// Trust proxy for secure headers on platforms like Vercel
app.set('trust proxy', 1);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Security headers with proper CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://www.google.com"],
    }
  },
  crossOriginEmbedderPolicy: false,
}));

// Restrict CORS origins
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(morgan('dev', {
  skip: (req) => !req.url.startsWith('/api')
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'public', 'uploads')));

// API Routes
app.use('/api/', limiter);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/goals', questRoutes);
app.use('/api/logs', logRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
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

export default app;
