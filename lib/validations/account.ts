import { z } from "zod";

export const createSocialAccountSchema = z.object({
  workspaceId: z.string(),
  platform: z.enum(["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X", "TIKTOK"]),
  accountName: z.string().min(1, "Account name is required"),
  accountId: z.string().optional(),
  status: z
    .enum(["PENDING", "CONNECTED", "EXPIRED", "ERROR", "DISCONNECTED"])
    .optional(),
});

export const updateSocialAccountSchema = createSocialAccountSchema
  .partial()
  .omit({ workspaceId: true });

export type CreateSocialAccountInput = z.infer<typeof createSocialAccountSchema>;
