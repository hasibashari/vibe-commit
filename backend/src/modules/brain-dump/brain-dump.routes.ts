import { Router } from 'express';
import { z } from 'zod';
import { BrainDumpService } from './brain-dump.service.js';

const router = Router();

router.get('/:userId', (req, res) => {
  const dumps = BrainDumpService.getLatestDump(req.params.userId);
  res.json(dumps);
});

router.post('/', (req, res, next) => {
  try {
    const schema = z.object({
      id: z.string(),
      userId: z.string(),
      rawContent: z.string(),
      analysis: z.any()
    });
    const data = schema.parse(req.body);
    const result = BrainDumpService.createDump(data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
