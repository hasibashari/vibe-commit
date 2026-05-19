import { Router } from 'express';
import { AiController } from './ai.controller.js';
import { authenticateToken } from '../auth/auth.middleware.js';

const router = Router();

// Protect all routes in this router
router.use(authenticateToken);

router.post('/analyze-brain-dump', AiController.analyzeBrainDump);
router.post('/chat', AiController.chat);

export default router;

