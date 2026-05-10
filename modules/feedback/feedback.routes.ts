import { Router } from 'express';
import * as feedbackController from './feedback.controller';
import { protect, authorize } from '../auth/auth.middleware';
import { ROLE } from '../auth/auth.types';

const router = Router();

// Public: submit feedback (no auth required) and view published feedback
router.post('/', feedbackController.submit);
router.get('/', feedbackController.getAll);
router.get('/stats', feedbackController.getStats);
router.get('/:id', feedbackController.getOne);

// Public: upvote published feedback
router.patch('/:id/upvote', feedbackController.upvote);

// Admin / Ministry: moderation (publish, reject, reply)
router.patch(
  '/:id/moderate',
  protect,
  authorize(ROLE.MINISTRY_OPERATOR, ROLE.MINISTRY_APPROVER, ROLE.SUPER_ADMIN),
  feedbackController.moderate
);

// Super Admin: delete
router.delete('/:id', protect, authorize(ROLE.SUPER_ADMIN), feedbackController.remove);

export default router;
