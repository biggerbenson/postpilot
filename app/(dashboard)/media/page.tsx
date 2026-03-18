import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { MediaLibrary } from "@/features/media/media-library";

export default async function MediaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: user.id, deletedAt: null },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Media library</h1>
        <p className="text-muted-foreground">
          Upload and manage images and videos for your posts
        </p>
      </div>
      <MediaLibrary workspaces={workspaces} />
    </div>
  );
}
