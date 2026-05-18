import { Router } from 'express';
import { LogController } from './log.controller.js';

const router = Router();

router.get('/user/:userId', LogController.getLogsForUser);
router.get('/:goalId', LogController.getLogsForGoal);
router.post('/', LogController.createLog);

export default router;
