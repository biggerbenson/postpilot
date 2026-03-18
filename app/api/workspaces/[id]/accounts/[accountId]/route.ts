import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { assertWorkspaceAccess } from "@/server/services/workspace";
import { prisma } from "@/lib/db";
import { updateSocialAccountSchema } from "@/lib/validations/account";
import { ActivityAction, ConnectionStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; accountId: string }> }
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: workspaceId, accountId } = await params;
  try {
    await assertWorkspaceAccess(workspaceId, user.id);
  } catch {
    return NextResponse.json(
      { message: "Workspace not found" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const parsed = updateSocialAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          parsed.error.errors[0]?.message ?? "Validation failed",
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const account = await prisma.socialAccount.update({
    where: { id: accountId },
    data: {
      ...(data.accountName !== undefined && {
        accountName: data.accountName,
      }),
      ...(data.accountId !== undefined && {
        accountId: data.accountId,
      }),
      ...(data.status !== undefined && {
        status: data.status as ConnectionStatus,
      }),
    },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId: user.id,
      action: ActivityAction.ACCOUNT_CONNECTED,
      entityType: "account",
      entityId: account.id,
      metadata: { edited: true },
    },
  });

  return NextResponse.json(account);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; accountId: string }> }
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: workspaceId, accountId } = await params;
  try {
    await assertWorkspaceAccess(workspaceId, user.id);
  } catch {
    return NextResponse.json(
      { message: "Workspace not found" },
      { status: 404 }
    );
  }

  const existing = await prisma.socialAccount.findFirst({
    where: { id: accountId, workspaceId },
  });
  if (!existing) {
    return NextResponse.json(
      { message: "Account not found" },
      { status: 404 }
    );
  }

  await prisma.socialAccount.delete({
    where: { id: accountId },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId: user.id,
      action: ActivityAction.ACCOUNT_DISCONNECTED,
      entityType: "account",
      entityId: accountId,
    },
  });

  return NextResponse.json({ ok: true });
}

