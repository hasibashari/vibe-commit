import { Router } from 'express';
import { AiController } from './ai.controller.js';

const router = Router();

router.post('/analyze-brain-dump', AiController.analyzeBrainDump);
router.post('/chat', AiController.chat);

export default router;
