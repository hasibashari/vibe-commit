import { Router } from 'express';
import * as AiController from './ai.controller.js';
import { authenticateToken } from '../auth/auth.middleware.js';

const router = Router();

// Protect all AI routes
router.use(authenticateToken);

router.post('/chat', AiController.generateQuest);

export default router;
