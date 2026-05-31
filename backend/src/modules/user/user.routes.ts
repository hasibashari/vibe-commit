import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticateToken } from '../auth/auth.middleware.js';

const router = Router();

// Protect all routes in this router
router.use(authenticateToken);

router.get('/:id', UserController.getUser);
router.put('/:id', UserController.updateUser);
router.post('/:id/buy-item', UserController.buyItem);
router.post('/:id/sandbox', UserController.sandboxUpdate);
router.post('/:id/reset', UserController.resetUser);
router.post('/:id/import', UserController.importData);
router.delete('/:id', UserController.deleteAccount);

export default router;

