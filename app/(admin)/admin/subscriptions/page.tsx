import { requireAdmin } from "@/server/admin/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const subs = await prisma.subscription.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">Manage subscription records.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="text-left py-2 pr-4">User</th>
                <th className="text-left py-2 pr-4">Plan</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2 pr-4">Period end</th>
                <th className="text-left py-2 pr-4">Provider</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">{s.user.email}</td>
                  <td className="py-3 pr-4">{s.plan}</td>
                  <td className="py-3 pr-4">{s.status}</td>
                  <td className="py-3 pr-4">
                    {new Date(s.currentPeriodEnd).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4">{s.provider ?? "—"}</td>
                </tr>
              ))}
              {subs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">
                    No subscriptions found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

