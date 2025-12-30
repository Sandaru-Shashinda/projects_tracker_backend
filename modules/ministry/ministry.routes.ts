import { Router } from 'express';
import * as ministryController from './ministry.controller';
import { protect, authorize } from '../auth/auth.middleware';
import { ROLE } from '../auth/auth.types';

const router = Router();

// Public Routes
router.get('/', ministryController.getAll);
router.get('/:id', ministryController.getOne);

// Protected Routes
// Create: Only Admin
router.post('/', protect, authorize(ROLE.SUPER_ADMIN), ministryController.create);

// Update: Super Admin or Ministry Approver (Ownership check is in service)
router.put('/:id', protect, authorize(ROLE.SUPER_ADMIN, ROLE.MINISTRY_APPROVER), ministryController.update);

// Delete: Only Admin
router.delete('/:id', protect, authorize(ROLE.SUPER_ADMIN), ministryController.remove);

export default router;