import { requireAdmin } from "@/server/admin/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminLogsPage() {
  await requireAdmin();

  const logs = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { email: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Activity logs</h1>
        <p className="text-muted-foreground">Audit trail of admin actions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest actions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="text-left py-2 pr-4">When</th>
                <th className="text-left py-2 pr-4">Admin</th>
                <th className="text-left py-2 pr-4">Action</th>
                <th className="text-left py-2 pr-4">Target</th>
                <th className="text-left py-2 pr-4">Summary</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b last:border-0 align-top">
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {l.createdAt.toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">{l.actor.email}</td>
                  <td className="py-3 pr-4 font-medium">{l.action}</td>
                  <td className="py-3 pr-4">
                    {l.targetType ? `${l.targetType}:${l.targetId ?? ""}` : "—"}
                  </td>
                  <td className="py-3 pr-4">{l.summary}</td>
                </tr>
              ))}
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">
                    No admin actions yet.
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

