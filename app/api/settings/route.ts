import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  timezone: z.string().optional(),
  defaultApprovalMode: z.enum(["MANUAL", "AUTO"]).optional(),
  defaultPostingFrequency: z.string().nullable().optional(),
  defaultPostingTimes: z.string().nullable().optional(),
  notificationsEnabled: z.boolean().optional(),
  notifyOnPostPublished: z.boolean().optional(),
  notifyOnPostFailed: z.boolean().optional(),
  notifyOnApprovalRequired: z.boolean().optional(),
  notifyOnAccountDisconnected: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          parsed.error.errors[0]?.message ?? "Validation failed",
      },
      { status: 400 }
    );
  }

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...parsed.data,
    },
    update: parsed.data,
  });

  return NextResponse.json({ ok: true });
}

