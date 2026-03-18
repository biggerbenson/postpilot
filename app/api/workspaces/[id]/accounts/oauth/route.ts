import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { assertWorkspaceAccess } from "@/server/services/workspace";
import { prisma } from "@/lib/db";
import { ActivityAction, ConnectionStatus } from "@prisma/client";
import { z } from "zod";
import { getEntitlements } from "@/lib/subscriptions/service";
import { canConnectAnotherAccount } from "@/lib/subscriptions/gating";

const bodySchema = z.object({
  platform: z.enum(["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X", "TIKTOK"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const entitlements = await getEntitlements(user.id);
  const gate = canConnectAnotherAccount(entitlements);
  if (!gate.ok) return NextResponse.json(gate, { status: 402 });

  const { id: workspaceId } = await params;
  try {
    await assertWorkspaceAccess(workspaceId, user.id);
  } catch {
    return NextResponse.json(
      { message: "Workspace not found" },
      { status: 404 }
    );
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          parsed.error.errors[0]?.message ?? "Invalid platform for connection",
      },
      { status: 400 }
    );
  }

  const platform = parsed.data.platform;
  const label = platform === "X" ? "X (Twitter)" : platform;

  // In a real integration, this is where you'd:
  // - redirect to the provider's OAuth consent screen
  // - exchange the code for tokens on callback
  // - look up the account id and name from the provider API
  //
  // For this MVP, we simulate a successful OAuth connection and store
  // a placeholder account with a mock token and id.

  const now = Date.now().toString(36);
  const mockAccountId = `${platform.toLowerCase()}_${now}`;

  const account = await prisma.socialAccount.create({
    data: {
      workspaceId,
      platform,
      accountName: `Connected ${label}`,
      accountId: mockAccountId,
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      tokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      status: ConnectionStatus.CONNECTED,
      metadata: {
        simulated: true,
        note: "Mock OAuth connection. Replace with real provider integration.",
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId: user.id,
      action: ActivityAction.ACCOUNT_CONNECTED,
      entityType: "account",
      entityId: account.id,
      metadata: {
        via: "oauth-mock",
        platform,
      },
    },
  });

  return NextResponse.json(account);
}

