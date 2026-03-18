import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { ScheduleForm } from "@/features/posts/schedule-form";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ workspaceId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { workspaceId: queryWorkspaceId } = await searchParams;
  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: user.id, deletedAt: null },
    orderBy: { name: "asc" },
  });
  const workspaceId = queryWorkspaceId ?? workspaces[0]?.id ?? "";

  const [accounts, media] = await Promise.all([
    workspaceId
      ? prisma.socialAccount.findMany({ where: { workspaceId } })
      : Promise.resolve([]),
    workspaceId
      ? prisma.mediaAsset.findMany({
          where: { workspaceId, status: "active" },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create schedule</h1>
        <p className="text-muted-foreground">
          Generate a content plan for the next days using your media
        </p>
      </div>
      <ScheduleForm
        workspaces={workspaces}
        accounts={accounts}
        media={media}
        defaultWorkspaceId={workspaceId}
      />
    </div>
  );
}
