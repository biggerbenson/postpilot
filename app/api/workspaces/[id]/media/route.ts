import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { assertWorkspaceAccess } from "@/server/services/workspace";
import { createMediaAsset } from "@/server/services/media";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
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

  const { searchParams } = new URL(_req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status") ?? "active";

  const where: { workspaceId: string; status?: string; mediaType?: "IMAGE" | "VIDEO" } = { workspaceId };
  if (type === "image") where.mediaType = "IMAGE";
  else if (type === "video") where.mediaType = "VIDEO";
  if (status) where.status = status;

  const media = await prisma.mediaAsset.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(media);
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

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await createMediaAsset(workspaceId, user.id, {
      buffer,
      mimetype: file.type,
      originalname: file.name,
      size: file.size,
    });
    return NextResponse.json(asset);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}
