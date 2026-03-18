import { z } from "zod";

export const createPostSchema = z.object({
  workspaceId: z.string(),
  socialAccountId: z.string(),
  caption: z.string().min(1, "Caption is required"),
  shortCaption: z.string().optional(),
  headline: z.string().optional(),
  cta: z.string().optional(),
  hashtags: z.string().optional(),
  platformNotes: z.string().optional(),
  platform: z.enum(["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X", "TIKTOK"]),
  mediaIds: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z
    .enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "SCHEDULED"])
    .optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const schedulePlanSchema = z.object({
  workspaceId: z.string(),
  socialAccountIds: z.array(z.string()).min(1),
  durationDays: z.number().min(1).max(90),
  frequency: z.enum(["daily", "weekdays", "custom"]),
  customDays: z.array(z.number().min(0).max(6)).optional(),
  times: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
  approvalMode: z.enum(["MANUAL", "AUTO"]),
  mediaIds: z.array(z.string()).min(1),
  platforms: z
    .array(z.enum(["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X", "TIKTOK"]))
    .min(1),
  autoGenerateImages: z.boolean().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type SchedulePlanInput = z.infer<typeof schedulePlanSchema>;
