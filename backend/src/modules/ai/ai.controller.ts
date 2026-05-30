import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AiService } from './ai.service.js';

export class AiController {
  static async analyzeBrainDump(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({ content: z.string() });
      const { content } = schema.parse(req.body);

      const result = await AiService.analyzeBrainDump(content);
      res.json(result);
    } catch (err: any) {
      if (err.message && err.message.includes('API key not valid')) {
        return res.status(400).json({ error: 'API key Gemini tidak valid. Silakan periksa kunci API Anda di pengaturan.' });
      }
      next(err);
    }
  }

  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        history: z.array(z.object({
          role: z.enum(['user', 'model']),
          content: z.string()
        })),
        context: z.object({
          userName: z.string().optional(),
          level: z.number().optional(),
          hp: z.number().optional(),
          mana: z.number().optional(),
          activeQuests: z.string().optional(),
        })
      });

      const { history, context } = schema.parse(req.body);
      console.log('AI Chat Controller Context Received:', context);

      const result = await AiService.chat(history, context);
      res.json({ response: result });
    } catch (err: any) {
      if (err.message && err.message.includes('NOT_CONFIGURED')) {
        return res.json({ response: "Maaf, API Key belum di-set. Coba configure environment variable dulu ya!" });
      }
      if (err.message && err.message.includes('API key not valid')) {
        return res.json({ response: "Uh oh, sepertinya API Key yang dimasukkan tidak valid. Coba dicek lagi ya." });
      }
      next(err);
    }
  }
}
