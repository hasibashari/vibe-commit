import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service.js';

export class AuthController {
  static async register(req: Request, res: Response, _next: NextFunction) {
    try {
      const schema = z.object({
        username: z.string().min(2, 'Username minimal 2 karakter').max(30, 'Username maksimal 30 karakter'),
        password: z.string().min(4, 'Password minimal 4 karakter')
      });
      const { username, password } = schema.parse(req.body);
      
      const result = await AuthService.register(username, password);
      res.json({ success: true, user: result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response, _next: NextFunction) {
    try {
      const schema = z.object({
        username: z.string(),
        password: z.string()
      });
      const { username, password } = schema.parse(req.body);

      const result = await AuthService.login(username, password);
      res.json({ success: true, user: result });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  static async guest(_req: Request, res: Response, _next: NextFunction) {
    try {
      const result = await AuthService.loginAsGuest();
      res.json({ success: true, user: result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
