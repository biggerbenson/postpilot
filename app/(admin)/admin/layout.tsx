import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/server/admin/auth";

const nav = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/transactions", label: "Transactions" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/settings/general", label: "General settings" },
  { href: "/admin/settings/ai", label: "AI settings" },
  { href: "/admin/settings/payments", label: "Payment settings" },
  { href: "/admin/admins", label: "Admin users" },
  { href: "/admin/logs", label: "Activity logs" },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 border-r bg-card">
        <div className="h-16 px-5 flex items-center border-b">
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold">PostPilot</p>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1">
        <header className="h-16 border-b bg-background flex items-center justify-between px-5">
          <p className="text-sm text-muted-foreground">
            Secure admin area (ADMIN / SUPER_ADMIN only)
          </p>
          <Link href="/dashboard" className="text-sm hover:underline">
            Back to app
          </Link>
        </header>
        <div className="p-5">{children}</div>
      </main>
    </div>
  );
}

