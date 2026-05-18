import { Router } from 'express';
import { UserController } from './user.controller.js';

const router = Router();

router.get('/:id', UserController.getUser);
router.put('/:id', UserController.updateUser);
router.post('/:id/buy-item', UserController.buyItem);
router.post('/:id/sandbox', UserController.sandboxUpdate);
router.post('/:id/reset', UserController.resetUser);
router.post('/:id/import', UserController.importData);

export default router;
