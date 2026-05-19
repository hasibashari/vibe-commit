import { Router } from 'express';
import { BrainDumpController } from './brain-dump.controller.js';
import { authenticateToken } from '../auth/auth.middleware.js';

const router = Router();

// Protect all routes in this router
router.use(authenticateToken);

router.get('/:userId', BrainDumpController.getLatestDump);
router.post('/', BrainDumpController.createDump);

export default router;

