import { z } from "zod";

export const updateProfileSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().max(100).nullable().optional(),
  displayName: z.string().max(100).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

