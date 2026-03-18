import { z } from "zod";

export const brandProfileSchema = z.object({
  businessType: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  targetAudience: z.string().optional(),
  toneOfVoice: z.string().optional(),
  mainGoals: z.string().optional(),
  productsServices: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  hashtags: z.string().optional(),
  keywordThemes: z.string().optional(),
  preferredPostingStyle: z.string().optional(),
  postingFrequency: z.string().optional(),
  postingDays: z.string().optional(),
  preferredTimes: z.string().optional(),
  ctaStyle: z.string().optional(),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().max(100).optional(),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export const createWorkspaceWithProfileSchema = createWorkspaceSchema.extend({
  brand: brandProfileSchema.optional(),
});

export type BrandProfileInput = z.infer<typeof brandProfileSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type CreateWorkspaceWithProfileSchema = z.infer<
  typeof createWorkspaceWithProfileSchema
>;
