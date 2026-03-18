import { requireSuperAdmin } from "@/server/admin/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminAdminsPage() {
  await requireSuperAdmin();

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    orderBy: { role: "desc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Admin users</h1>
        <p className="text-muted-foreground">
          SUPER_ADMIN only. Manage who can access the admin console.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admins</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Email</th>
                <th className="text-left py-2 pr-4">Role</th>
                <th className="text-left py-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">
                    <div className="font-medium">{a.email}</div>
                    {a.name ? (
                      <div className="text-xs text-muted-foreground">{a.name}</div>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">{a.role}</td>
                  <td className="py-3 pr-4">{a.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-muted-foreground">
                    No admins yet.
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

