import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserService } from './user.service.js';

export class UserController {
  static getUser(req: Request, res: Response, next: NextFunction) {
    if (req.params.id !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
      return;
    }
    try {
      res.json(UserService.getUser(req.params.id));
    } catch (err) {
      next(err);
    }
  }

  static updateUser(req: Request, res: Response, next: NextFunction) {
    if (req.params.id !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
      return;
    }
    try {
      const schema = z.object({
        name: z.string().optional(),
        title: z.string().optional(),
        avatar_color: z.string().optional(),
        avatar_icon: z.string().optional(),
        custom_main_bg: z.string().nullable().optional(),
        custom_char_bg: z.string().nullable().optional(),
        theme_vibe: z.string().optional(),
        bgm_theme: z.string().optional(),
        bgm_muted: z.number().int().optional()
      });
      const parsed = schema.parse(req.body);
      res.json(UserService.updateUser(req.params.id, parsed));
    } catch (err) {
      next(err);
    }
  }

  static buyItem(req: Request, res: Response, next: NextFunction) {
    if (req.params.id !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
      return;
    }
    try {
      const schema = z.object({ itemId: z.string() });
      const { itemId } = schema.parse(req.body);
      res.json(UserService.buyItem(req.params.id, itemId));
    } catch (err: any) {
      next(err);
    }
  }

  static sandboxUpdate(req: Request, res: Response, _next: NextFunction) {
    if (req.params.id !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
      return;
    }
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({ error: 'Sandbox mode is disabled in production' });
      return;
    }

    try {
      const { hp, mana, level, coins_delta } = req.body;
      res.json(UserService.sandboxUpdate(req.params.id, { hp, mana, level, coins_delta }));
    } catch(err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static resetUser(req: Request, res: Response, next: NextFunction) {
    if (req.params.id !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
      return;
    }
    try {
      UserService.resetUser(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  static deleteAccount(req: Request, res: Response, next: NextFunction) {
    if (req.params.id !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
      return;
    }
    try {
      UserService.deleteAccount(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  static importData(req: Request, res: Response, next: NextFunction) {
    if (req.params.id !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
      return;
    }
    try {
      const importSchema = z.object({
        user: z.object({
          name: z.string().optional().nullable(),
          title: z.string().optional().nullable(),
          avatar_color: z.string().optional().nullable(),
          custom_main_bg: z.string().optional().nullable(),
          custom_char_bg: z.string().optional().nullable(),
          theme_vibe: z.string().optional().nullable(),
          bgm_theme: z.string().optional().nullable(),
          bgm_muted: z.number().int().optional().nullable(),
          hp: z.coerce.number().optional().nullable(),
          mana: z.coerce.number().optional().nullable(),
          level: z.coerce.number().optional().nullable(),
          exp: z.coerce.number().optional().nullable(),
        }).optional().nullable(),
        goals: z.array(z.any()).optional().nullable()
      });
      
      const parsed = importSchema.parse(req.body);
      UserService.importData(req.params.id, parsed);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}
