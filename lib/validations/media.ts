import { z } from "zod";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
export const MAX_FILE_SIZE_IMAGE = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE_VIDEO = 100 * 1024 * 1024; // 100MB

export const updateMediaSchema = z.object({
  altCaption: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).optional(),
  campaignNotes: z.string().max(5000).optional(),
});

export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
