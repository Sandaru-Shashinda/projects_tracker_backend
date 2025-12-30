import { z } from 'zod';

export const createMinistrySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").max(10, "Code cannot exceed 10 characters"),
  logoUrl: z.string().url("Invalid URL for logo").optional(),
  description: z.string().optional(),
  website: z.string().url("Invalid website URL").optional(),
  contactDetails: z.object({
    phone: z.string().optional(),
    email: z.string().email("Invalid contact email").optional(),
    address: z.string().optional(),
  }).optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateMinistrySchema = createMinistrySchema.partial();

export const ministryIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Ministry ID"),
});