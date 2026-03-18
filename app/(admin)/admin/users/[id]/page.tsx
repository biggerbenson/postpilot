import { requireAdmin } from "@/server/admin/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminUserActions } from "@/features/admin/users/admin-user-actions";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      subscription: true,
      usageRecords: { orderBy: { periodStart: "desc" }, take: 1 },
      workspaces: { where: { deletedAt: null }, select: { id: true } },
    },
  });

  if (!user) {
    return (
      <div className="text-muted-foreground">User not found.</div>
    );
  }

  const socialAccounts = await prisma.socialAccount.count({
    where: { workspace: { ownerId: user.id } },
  });

  const latestUsage = user.usageRecords[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{user.email}</h1>
          <p className="text-muted-foreground">User profile and controls.</p>
        </div>
        <AdminUserActions
          userId={user.id}
          currentRole={user.role}
          suspended={Boolean(user.suspendedAt)}
          currentPlan={user.subscription?.plan ?? "FREE"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span>{user.role}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{user.suspendedAt ? "SUSPENDED" : "ACTIVE"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{user.createdAt.toLocaleString()}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span>{user.subscription?.plan ?? "FREE"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{user.subscription?.status ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Period end</span><span>{user.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString() : "—"}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">AI gens</span><span>{latestUsage?.aiGenerations ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Regens</span><span>{latestUsage?.regenerations ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Workspaces</span><span>{user.workspaces.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Social accounts</span><span>{socialAccounts}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

