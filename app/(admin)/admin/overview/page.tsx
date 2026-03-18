import { requireAdmin } from "@/server/admin/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [
    totalUsers,
    activeSubs,
    subsByPlan,
    aiThisMonth,
    scheduledPosts,
    newUsers7d,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.groupBy({ by: ["plan"], _count: { plan: true } }),
    prisma.usageRecord.aggregate({ _sum: { aiGenerations: true } }),
    prisma.post.count({ where: { status: "SCHEDULED" } }),
    prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  const planMap = Object.fromEntries(subsByPlan.map((p) => [p.plan, p._count.plan]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground">
          High-level platform metrics (MVP admin dashboard).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total users</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{totalUsers}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{activeSubs}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI generations (all time)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {aiThisMonth._sum.aiGenerations ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scheduled posts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{scheduledPosts}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.entries(planMap).length === 0 ? (
              <p className="text-muted-foreground">No subscriptions yet.</p>
            ) : (
              Object.entries(planMap).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <span>{plan}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New users (7 days)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{newUsers7d}</CardContent>
        </Card>
      </div>
    </div>
  );
}

