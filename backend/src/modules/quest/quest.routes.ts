import { Router } from 'express';
import { QuestController } from './quest.controller.js';

const router = Router();

router.get('/:userId', QuestController.getGoalsForUser);
router.post('/', QuestController.createGoal);
router.put('/:id', QuestController.updateGoal);
router.delete('/:id', QuestController.deleteGoal);
router.patch('/:id/difficulty', QuestController.updateDifficulty);

export default router;
