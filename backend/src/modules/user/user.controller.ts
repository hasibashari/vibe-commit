import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserService } from './user.service.js';

export class UserController {
  static async getUser(req: Request, res: Response, next: NextFunction) {
    if (req.params.id !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
      return;
    }
    try {
      const result = await UserService.getUser(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
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
      const result = await UserService.updateUser(req.params.id, parsed);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async buyItem(req: Request, res: Response, next: NextFunction) {
    if (req.params.id !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
      return;
    }
    try {
      const schema = z.object({ itemId: z.string() });
      const { itemId } = schema.parse(req.body);
      const result = await UserService.buyItem(req.params.id, itemId);
      res.json(result);
    } catch (err: any) {
      next(err);
    }
  }

  static async sandboxUpdate(req: Request, res: Response, _next: NextFunction) {
    if (req.params.id !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
      return;
    }
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({ error: 'Sandbox mode is disabled in production' });
      return;
    }

    try {
      const { hp, mana, level, coins_delta, sandbox_date_offset } = req.body;
      const result = await UserService.sandboxUpdate(req.params.id, { hp, mana, level, coins_delta, sandbox_date_offset });
      res.json(result);
    } catch(err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async resetUser(req: Request, res: Response, next: NextFunction) {
    if (req.params.id !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
      return;
    }
    try {
      await UserService.resetUser(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAccount(req: Request, res: Response, next: NextFunction) {
    if (req.params.id !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
      return;
    }
    try {
      await UserService.deleteAccount(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  static async importData(req: Request, res: Response, next: NextFunction) {
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
      await UserService.importData(req.params.id, parsed);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}
