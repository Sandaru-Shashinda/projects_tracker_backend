import { Router } from 'express';
import * as projectController from './project.controller';
import { protect, authorize } from '../auth/auth.middleware';
import { ROLE } from '../auth/auth.types';

const router = Router();

// --- Public & Semi-Public Routes ---
// The service layer handles what data is visible based on whether a user is logged in or not.
router.get('/', projectController.getAll);
router.get('/stats/dashboard', projectController.getDashboardStats);
router.get('/:id', projectController.getOne);

// --- Protected Routes for Ministry Operators ---
router.post('/', protect, authorize(ROLE.MINISTRY_OPERATOR), projectController.create);
router.put('/:id', protect, authorize(ROLE.MINISTRY_OPERATOR, ROLE.SUPER_ADMIN), projectController.update);

// --- Approval Workflow Routes ---
router.patch('/:id/submit', protect, authorize(ROLE.MINISTRY_OPERATOR), projectController.submit);

router.patch('/:id/approve', protect, authorize(ROLE.MINISTRY_APPROVER, ROLE.SUPER_ADMIN), projectController.approve);

router.patch('/:id/reject', protect, authorize(ROLE.MINISTRY_APPROVER, ROLE.SUPER_ADMIN), projectController.reject);


// --- Super Admin Routes ---
router.delete('/:id', protect, authorize(ROLE.SUPER_ADMIN), projectController.remove);


export default router;