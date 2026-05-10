import { z } from 'zod';
import { FEEDBACK_STATUS, FEEDBACK_TYPE } from './feedback.types';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const createFeedbackSchema = z.object({
  projectId: objectIdSchema,
  type: z.nativeEnum(FEEDBACK_TYPE),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  isAnonymous: z.boolean().default(false),
  tempName: z.string().min(2).max(100).optional(),
});

export const updateFeedbackStatusSchema = z.object({
  status: z.nativeEnum(FEEDBACK_STATUS),
  adminReply: z.string().max(2000).optional(),
  resolved: z.boolean().optional(),
});

export const filterQuerySchema = z.object({
  projectId: objectIdSchema.optional(),
  ministryId: objectIdSchema.optional(),
  type: z.nativeEnum(FEEDBACK_TYPE).optional(),
  status: z.nativeEnum(FEEDBACK_STATUS).optional(),
  resolved: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const feedbackIdSchema = z.object({
  id: objectIdSchema,
});
