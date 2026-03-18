import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { ConnectedAccounts } from "@/features/accounts/connected-accounts";

export default async function AccountsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: user.id, deletedAt: null },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Connected accounts</h1>
        <p className="text-muted-foreground">
          Connect your social accounts using the buttons below. These use a
          mock OAuth flow so you can test scheduling and publishing without
          real provider keys.
        </p>
      </div>
      <ConnectedAccounts workspaces={workspaces} />
    </div>
  );
}

