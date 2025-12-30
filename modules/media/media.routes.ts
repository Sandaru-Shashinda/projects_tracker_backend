import { Router } from 'express';
import multer from 'multer';
import * as mediaController from './media.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

// Configure Multer to store files in memory (RAM) temporarily
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
  },
});

router.post('/upload', protect, upload.single('file'), mediaController.uploadMedia);

export default router;