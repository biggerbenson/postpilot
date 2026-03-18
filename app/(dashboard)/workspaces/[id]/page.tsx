import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { assertWorkspaceAccess } from "@/server/services/workspace";
import { Button } from "@/components/ui/button";
import { WorkspaceForm } from "@/features/workspace/workspace-form";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  let workspace = null;
  try {
    await assertWorkspaceAccess(id, user.id);
    workspace = await prisma.workspace.findUnique({
      where: { id },
      include: { brandProfile: true },
    });
  } catch {
    notFound();
  }

  if (!workspace) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/workspaces">
          <Button variant="ghost" size="sm">← Workspaces</Button>
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold">Edit workspace</h1>
        <p className="text-muted-foreground">{workspace.name}</p>
      </div>
      <WorkspaceForm workspace={workspace} />
    </div>
  );
}
