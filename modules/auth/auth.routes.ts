import { Router } from 'express';
import * as authController from './auth.controller';
import { protect } from './auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

export default router;