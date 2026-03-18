import Link from "next/link";
import { requireAdmin } from "@/server/admin/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      suspendedAt: true,
      createdAt: true,
      subscription: { select: { plan: true, status: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Search and manage users.</p>
        </div>

        <form className="flex items-center gap-2" action="/admin/users">
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search email or name..."
            className="w-64"
          />
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest users</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="text-left py-2 pr-4">User</th>
                <th className="text-left py-2 pr-4">Role</th>
                <th className="text-left py-2 pr-4">Plan</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/users/${u.id}`} className="font-medium hover:underline">
                      {u.email}
                    </Link>
                    {u.name ? <div className="text-xs text-muted-foreground">{u.name}</div> : null}
                  </td>
                  <td className="py-3 pr-4">{u.role}</td>
                  <td className="py-3 pr-4">{u.subscription?.plan ?? "—"}</td>
                  <td className="py-3 pr-4">
                    {u.suspendedAt ? "SUSPENDED" : u.subscription?.status ?? "—"}
                  </td>
                  <td className="py-3 pr-4">{u.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">
                    No users found.
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

