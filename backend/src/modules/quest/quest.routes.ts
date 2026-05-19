import { Router } from 'express';
import { QuestController } from './quest.controller.js';
import { authenticateToken } from '../auth/auth.middleware.js';

const router = Router();

// Protect all routes in this router
router.use(authenticateToken);

router.get('/:userId', QuestController.getGoalsForUser);
router.post('/', QuestController.createGoal);
router.put('/:id', QuestController.updateGoal);
router.delete('/:id', QuestController.deleteGoal);
router.patch('/:id/difficulty', QuestController.updateDifficulty);

export default router;

