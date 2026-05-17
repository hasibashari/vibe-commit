import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Initialize firebase admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: "gen-lang-client-0061436572"
    });
  } catch (err) {
    console.error('Firebase admin setup error', err);
  }
}

export interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase Auth Error:', (error as any).message);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireUserMatch = (paramName: string = 'id') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const requestedId = req.params[paramName];
    if (req.user.uid !== requestedId) {
      res.status(403).json({ error: 'Forbidden: Cannot access other users data' });
      return;
    }
    next();
  };
};
