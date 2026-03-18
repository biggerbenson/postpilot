import { redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/server/auth";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b flex items-center justify-center">
          <a href="/dashboard" className="block">
            <Image
              src="/postpilot-logo.png"
              alt="PostPilot - Auto Social Scheduler"
              width={180}
              height={60}
              sizes="220px"
              className="h-12 w-auto object-contain"
              priority
            />
          </a>
        </div>
        <DashboardNav />
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b flex items-center px-4 sm:px-6">
          <DashboardHeader email={session.user?.email ?? null} />
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}


