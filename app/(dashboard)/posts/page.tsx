import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { PostsList } from "@/features/posts/posts-list";

export default async function PostsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: user.id, deletedAt: null },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Posts</h1>
        <p className="text-muted-foreground">
          Manage and schedule your content
        </p>
      </div>
      <PostsList workspaces={workspaces} />
    </div>
  );
}
