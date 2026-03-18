import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { assertWorkspaceAccess } from "@/server/services/workspace";
import { prisma } from "@/lib/db";
import { createPostSchema } from "@/lib/validations/post";
import { ActivityAction } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: workspaceId } = await params;
  try {
    await assertWorkspaceAccess(workspaceId, user.id);
  } catch {
    return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");

  const where: { workspaceId: string; status?: string; platform?: string } = { workspaceId };
  if (status) where.status = status;
  if (platform) where.platform = platform;

  const posts = await prisma.post.findMany({
    where,
    include: {
      socialAccount: true,
      media: { include: { media: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(posts);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: workspaceId } = await params;
  try {
    await assertWorkspaceAccess(workspaceId, user.id);
  } catch {
    return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = createPostSchema.safeParse({ ...body, workspaceId });
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const { socialAccountId, caption, shortCaption, headline, cta, hashtags, platformNotes, platform, mediaIds, scheduledAt, status } = parsed.data;

  const account = await prisma.socialAccount.findFirst({
    where: { id: socialAccountId, workspaceId },
  });
  if (!account) {
    return NextResponse.json({ message: "Social account not found" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      workspaceId,
      socialAccountId,
      caption,
      shortCaption: shortCaption ?? null,
      headline: headline ?? null,
      cta: cta ?? null,
      hashtags: hashtags ?? null,
      platformNotes: platformNotes ?? null,
      platform: platform as "INSTAGRAM" | "FACEBOOK" | "LINKEDIN" | "X" | "TIKTOK",
      status: (status as "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "SCHEDULED") ?? "DRAFT",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      ...(mediaIds?.length && {
        media: {
          create: mediaIds.map((mediaAssetId, i) => ({ mediaAssetId, sortOrder: i })),
        },
      }),
    },
    include: { socialAccount: true, media: { include: { media: true } } },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId: user.id,
      action: ActivityAction.POST_GENERATED,
      entityType: "post",
      entityId: post.id,
    },
  });

  return NextResponse.json(post);
}
