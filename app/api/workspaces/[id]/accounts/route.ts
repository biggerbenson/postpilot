import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { assertWorkspaceAccess } from "@/server/services/workspace";
import { prisma } from "@/lib/db";
import { createSocialAccountSchema } from "@/lib/validations/account";
import { ActivityAction } from "@prisma/client";

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

  const accounts = await prisma.socialAccount.findMany({
    where: { workspaceId },
    orderBy: { platform: "asc" },
  });
  return NextResponse.json(accounts);
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
  const parsed = createSocialAccountSchema.safeParse({ ...body, workspaceId });
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const account = await prisma.socialAccount.create({
    data: {
      workspaceId,
      platform: parsed.data.platform as "INSTAGRAM" | "FACEBOOK" | "LINKEDIN" | "X" | "TIKTOK",
      accountName: parsed.data.accountName,
      accountId: parsed.data.accountId ?? null,
      status: (parsed.data.status as "PENDING" | "CONNECTED" | "EXPIRED" | "ERROR" | "DISCONNECTED") ?? "PENDING",
    },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId: user.id,
      action: ActivityAction.ACCOUNT_CONNECTED,
      entityType: "account",
      entityId: account.id,
    },
  });

  return NextResponse.json(account);
}
