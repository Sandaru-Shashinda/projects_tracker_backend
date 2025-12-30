import { z } from 'zod';
import { APPROVAL_STATUS, KEY_PEOPLE_ROLE, PROJECT_STATUS } from './project.types';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const keyPersonSchema = z.object({
  role: z.nativeEnum(KEY_PEOPLE_ROLE),
  name: z.string().min(2),
  designation: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  active: z.boolean().default(true),
  notes: z.string().optional(),
});

const scheduleSchema = z.object({
  planned: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  }),
  actual: z.object({
    startDate: z.coerce.date().optional(),
    expectedCompletionDate: z.coerce.date().optional(),
    completionDate: z.coerce.date().optional(),
  }).optional(),
  delayReason: z.string().optional(),
  progressPercentage: z.number().min(0).max(100).default(0),
});

const milestoneSchema = z.object({
  title: z.string().min(3),
  date: z.coerce.date(),
  completed: z.boolean().default(false),
});

const evidenceSchema = z.object({
  title: z.string().min(3),
  url: z.string().url(),
  type: z.enum(['IMAGE', 'DOCUMENT']),
  date: z.coerce.date().optional(),
});

export const createProjectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  sector: z.string().optional(),
  program: z.string().optional(),
  parentId: objectIdSchema.optional().nullable(),
  location: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.array(z.number()).length(2), // [Longitude, Latitude]
  }).optional(),
  status: z.nativeEnum(PROJECT_STATUS).default(PROJECT_STATUS.PLANNED),
  keyPeople: z.array(keyPersonSchema).optional(),
  schedule: scheduleSchema,
  milestones: z.array(milestoneSchema).optional(),
  evidence: z.array(evidenceSchema).optional(),
  dependencies: z.array(objectIdSchema).optional(),
  budget: z.object({
    currency: z.string().default('LKR'),
    allocated: z.number().min(0),
    spent: z.number().min(0).default(0),
  }).optional(),
}).refine(data => {
    if (data.status === PROJECT_STATUS.DELAYED) {
        return typeof data.schedule.delayReason === 'string' && data.schedule.delayReason.length > 10;
    }
    return true;
}, { message: "A delay reason (min 10 chars) is required when project status is 'Delayed'", path: ["schedule", "delayReason"] });

export const updateProjectSchema = createProjectSchema.partial();

export const filterQuerySchema = z.object({
    ministryId: objectIdSchema.optional(),
    status: z.nativeEnum(PROJECT_STATUS).optional(),
    approvalStatus: z.nativeEnum(APPROVAL_STATUS).optional(),
    sector: z.string().optional(),
    program: z.string().optional(),
    parentId: objectIdSchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
});

export const projectIdSchema = z.object({
  id: objectIdSchema,
});