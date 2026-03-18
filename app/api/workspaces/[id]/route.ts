import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { assertWorkspaceAccess, updateWorkspace } from "@/server/services/workspace";
import { updateWorkspaceSchema } from "@/lib/validations/workspace";
import { brandProfileSchema } from "@/lib/validations/workspace";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await assertWorkspaceAccess(id, user.id);
  } catch {
    return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id },
    include: { brandProfile: true },
  });
  if (!workspace) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(workspace);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await assertWorkspaceAccess(id, user.id);
  } catch {
    return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const workspaceUpdate = updateWorkspaceSchema.safeParse(body);
    const brandUpdate = body.brand != null ? brandProfileSchema.safeParse(body.brand) : { success: true as const, data: undefined };

    if (!workspaceUpdate.success) {
      return NextResponse.json(
        { message: workspaceUpdate.error.errors[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }
    if (brandUpdate.success === false) {
      return NextResponse.json(
        { message: "Invalid brand profile" },
        { status: 400 }
      );
    }

    const workspace = await updateWorkspace(
      id,
      user.id,
      workspaceUpdate.data,
      brandUpdate.data
    );
    return NextResponse.json(workspace);
  } catch (e) {
    console.error("Update workspace error:", e);
    return NextResponse.json(
      { message: "Failed to update workspace" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { deleteWorkspace } = await import("@/server/services/workspace");
  try {
    await deleteWorkspace(id, user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
  }
}
