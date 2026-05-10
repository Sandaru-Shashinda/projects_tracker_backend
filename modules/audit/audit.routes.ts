import { Router } from 'express';
import { protect, authorize } from '../auth/auth.middleware';
import { ROLE } from '../auth/auth.types';
import * as auditController from './audit.controller';

const router = Router();

// Only super admins can view audit logs
router.get('/', protect, authorize(ROLE.SUPER_ADMIN), auditController.getLogs);

export default router;
