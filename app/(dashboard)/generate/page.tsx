import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { ContentGenerator } from "@/features/generate/content-generator";

export default async function GeneratePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: user.id, deletedAt: null },
    include: { brandProfile: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Generate captions</h1>
        <p className="text-muted-foreground">
          Use AI to generate captions from your brand profile and selected media
        </p>
      </div>
      <ContentGenerator workspaces={workspaces} />
    </div>
  );
}
