import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { createWorkspace } from "@/server/services/workspace";
import { createWorkspaceWithProfileSchema } from "@/lib/validations/workspace";
import { getEntitlements } from "@/lib/subscriptions/service";
import { canCreateWorkspace } from "@/lib/subscriptions/gating";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { prisma } = await import("@/lib/db");
  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: user.id, deletedAt: null },
    include: { brandProfile: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(workspaces);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const entitlements = await getEntitlements(user.id);
    const gate = canCreateWorkspace(entitlements);
    if (!gate.ok) return NextResponse.json(gate, { status: 402 });

    const body = await req.json();
    const parsed = createWorkspaceWithProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }
    const { name, slug, brand } = parsed.data;
    const workspace = await createWorkspace(user.id, { name, slug }, brand);
    return NextResponse.json(workspace);
  } catch (e) {
    console.error("Create workspace error:", e);
    return NextResponse.json(
      { message: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
