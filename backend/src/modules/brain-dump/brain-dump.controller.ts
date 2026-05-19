import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BrainDumpService } from './brain-dump.service.js';

export class BrainDumpController {
  static getLatestDump(req: Request, res: Response, next: NextFunction) {
    if (req.params.userId !== (req as any).user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied to other user brain dumps' });
      return;
    }
    try {
      const dumps = BrainDumpService.getLatestDump(req.params.userId);
      res.json(dumps);
    } catch (err) {
      next(err);
    }
  }

  static createDump(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        id: z.string(),
        userId: z.string(),
        rawContent: z.string(),
        analysis: z.any()
      });
      const data = schema.parse(req.body);
      
      if (data.userId !== (req as any).user?.id) {
        res.status(403).json({ error: 'Forbidden: Access denied to create brain dump for other user' });
        return;
      }
      
      const result = BrainDumpService.createDump(data);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
