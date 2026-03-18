import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { assertWorkspaceAccess } from "@/server/services/workspace";
import { prisma } from "@/lib/db";
import { updatePostSchema } from "@/lib/validations/post";
import { ActivityAction } from "@prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: workspaceId, postId } = await params;
  try {
    await assertWorkspaceAccess(workspaceId, user.id);
  } catch {
    return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
  }

  const post = await prisma.post.findFirst({
    where: { id: postId, workspaceId },
    include: {
      socialAccount: true,
      media: { include: { media: true } },
    },
  });
  if (!post) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: workspaceId, postId } = await params;
  try {
    await assertWorkspaceAccess(workspaceId, user.id);
  } catch {
    return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updateData: Parameters<typeof prisma.post.update>[0]["data"] = {};
  if (data.caption !== undefined) updateData.caption = data.caption;
  if (data.shortCaption !== undefined) updateData.shortCaption = data.shortCaption;
  if (data.headline !== undefined) updateData.headline = data.headline;
  if (data.cta !== undefined) updateData.cta = data.cta;
  if (data.hashtags !== undefined) updateData.hashtags = data.hashtags;
  if (data.platformNotes !== undefined) updateData.platformNotes = data.platformNotes;
  if (data.platform !== undefined) updateData.platform = data.platform as "INSTAGRAM" | "FACEBOOK" | "LINKEDIN" | "X" | "TIKTOK";
  if (data.status !== undefined) updateData.status = data.status as "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "FAILED" | "CANCELLED";
  if (data.scheduledAt !== undefined) updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;

  if (data.mediaIds?.length !== undefined) {
    await prisma.postMedia.deleteMany({ where: { postId } });
    if (data.mediaIds.length > 0) {
      await prisma.postMedia.createMany({
        data: data.mediaIds.map((mediaAssetId, sortOrder) => ({ postId, mediaAssetId, sortOrder })),
      });
    }
  }

  const post = await prisma.post.update({
    where: { id: postId },
    data: updateData,
    include: { socialAccount: true, media: { include: { media: true } } },
  });

  if (data.status === "APPROVED" || data.status === "SCHEDULED") {
    await prisma.activityLog.create({
      data: {
        workspaceId,
        userId: user.id,
        action: ActivityAction.POST_APPROVED,
        entityType: "post",
        entityId: postId,
      },
    });
  }

  return NextResponse.json(post);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: workspaceId, postId } = await params;
  try {
    await assertWorkspaceAccess(workspaceId, user.id);
  } catch {
    return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status: "CANCELLED" },
  });
  return NextResponse.json({ ok: true });
}
