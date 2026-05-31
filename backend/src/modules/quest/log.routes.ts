import { Router } from 'express';
import { LogController } from './log.controller.js';
import { authenticateToken } from '../auth/auth.middleware.js';

const router = Router();

// Protect all routes in this router
router.use(authenticateToken);

router.get('/user/:userId', LogController.getLogsForUser);
router.get('/:goalId', LogController.getLogsForGoal);
router.post('/', LogController.createLog);

export default router;

