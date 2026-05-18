import { Router } from 'express';
import { BrainDumpController } from './brain-dump.controller.js';

const router = Router();

router.get('/:userId', BrainDumpController.getLatestDump);
router.post('/', BrainDumpController.createDump);

export default router;
