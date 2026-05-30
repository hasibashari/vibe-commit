import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from './jwt.util.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

/**
 * Middleware to authenticate requests using JWT Bearer token.
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  const decoded = JwtUtil.verify(token);
  if (!decoded) {
    res.status(403).json({ error: 'Invalid or expired authentication token' });
    return;
  }

  // Cast req as any to dynamically assign user object to Express request safely
  (req as any).user = {
    id: decoded.id,
    username: decoded.username
  };

  next();
}
