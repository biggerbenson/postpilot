import { prisma } from "@/lib/db";
import { assertWorkspaceAccess } from "./workspace";
import type { SchedulePlanInput } from "@/lib/validations/post";
import { PostStatus } from "@prisma/client";
import { ActivityAction } from "@prisma/client";
import type { Platform } from "@prisma/client";
import { getEntitlements } from "@/lib/subscriptions/service";
import { canScheduleForDays } from "@/lib/subscriptions/gating";

function getNextSlots(
  durationDays: number,
  frequency: SchedulePlanInput["frequency"],
  customDays: number[] | undefined,
  times: string[]
): Date[] {
  const slots: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const dayInMs = 24 * 60 * 60 * 1000;
  const weekdays = [1, 2, 3, 4, 5];
  const allowedDays =
    frequency === "daily"
      ? [0, 1, 2, 3, 4, 5, 6]
      : frequency === "weekdays"
        ? weekdays
        : customDays ?? weekdays;

  for (let d = 0; d < durationDays; d++) {
    const date = new Date(start.getTime() + d * dayInMs);
    const day = date.getDay();
    if (!allowedDays.includes(day)) continue;
    for (const timeStr of times) {
      const [h, m] = timeStr.split(":").map(Number);
      const slot = new Date(date);
      slot.setHours(h, m, 0, 0);
      if (slot > new Date()) slots.push(slot);
    }
  }

  return slots.slice(0, 100);
}

export async function createSchedulePlan(
  userId: string,
  input: SchedulePlanInput
) {
  await assertWorkspaceAccess(input.workspaceId, userId);

  const entitlements = await getEntitlements(userId);
  const gate = canScheduleForDays(entitlements, input.durationDays);
  if (!gate.ok) throw new Error(gate.message);

  const accounts = await prisma.socialAccount.findMany({
    where: {
      id: { in: input.socialAccountIds },
      workspaceId: input.workspaceId,
    },
  });
  if (accounts.length === 0) throw new Error("No valid social accounts selected");

  const mediaAssets = await prisma.mediaAsset.findMany({
    where: {
      id: { in: input.mediaIds },
      workspaceId: input.workspaceId,
    },
  });
  if (mediaAssets.length === 0) throw new Error("No valid media selected");

  const slots = getNextSlots(
    input.durationDays,
    input.frequency,
    input.customDays,
    input.times
  );
  if (slots.length === 0) throw new Error("No schedule slots in range. Try different days or times.");

  const status: PostStatus =
    input.approvalMode === "AUTO" ? PostStatus.APPROVED : PostStatus.PENDING_APPROVAL;

  const posts: { id: string }[] = [];
  let mediaIndex = 0;
  let accountIndex = 0;
  let platformIndex = 0;
  for (const scheduledAt of slots) {
    const media = mediaAssets[mediaIndex % mediaAssets.length];
    const account = accounts[accountIndex % accounts.length];
    const platform =
      input.platforms[platformIndex % input.platforms.length] as Platform;

    const post = await prisma.post.create({
      data: {
        workspaceId: input.workspaceId,
        socialAccountId: account.id,
        caption: `Post for ${media.fileName}`,
        platform,
        status,
        scheduledAt,
        platformNotes: input.autoGenerateImages
          ? "Auto-generate images enabled (MVP placeholder)."
          : null,
        media: {
          create: [{ mediaAssetId: media.id, sortOrder: 0 }],
        },
      },
    });
    posts.push({ id: post.id });
    mediaIndex++;
    accountIndex++;
    platformIndex++;
  }

  await prisma.activityLog.create({
    data: {
      workspaceId: input.workspaceId,
      userId,
      action: ActivityAction.POST_SCHEDULED,
      entityType: "post",
      metadata: { count: posts.length },
    },
  });

  return { created: posts.length, postIds: posts.map((p) => p.id) };
}
