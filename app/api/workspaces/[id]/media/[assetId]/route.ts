import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { assertWorkspaceAccess } from "@/server/services/workspace";
import { deleteMediaAsset } from "@/server/services/media";
import { prisma } from "@/lib/db";
import { updateMediaSchema } from "@/lib/validations/media";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: workspaceId, assetId } = await params;
  try {
    await assertWorkspaceAccess(workspaceId, user.id);
  } catch {
    return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
  }

  const asset = await prisma.mediaAsset.findFirst({
    where: { id: assetId, workspaceId },
  });
  if (!asset) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(asset);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: workspaceId, assetId } = await params;
  try {
    await assertWorkspaceAccess(workspaceId, user.id);
  } catch {
    return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateMediaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const asset = await prisma.mediaAsset.update({
    where: { id: assetId },
    data: {
      ...(parsed.data.altCaption !== undefined && { altCaption: parsed.data.altCaption }),
      ...(parsed.data.tags !== undefined && { tags: parsed.data.tags }),
      ...(parsed.data.campaignNotes !== undefined && { campaignNotes: parsed.data.campaignNotes }),
    },
  });
  return NextResponse.json(asset);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: workspaceId, assetId } = await params;
  try {
    await deleteMediaAsset(assetId, workspaceId, user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Delete failed" },
      { status: 404 }
    );
  }
}
