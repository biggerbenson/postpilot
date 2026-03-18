import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/server/auth";
import { assertWorkspaceAccess } from "@/server/services/workspace";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PostDetailClient } from "@/features/posts/post-detail-client";

export default async function PostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ workspaceId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { workspaceId } = await searchParams;
  if (!workspaceId) redirect("/posts");

  try {
    await assertWorkspaceAccess(workspaceId, user.id);
  } catch {
    notFound();
  }

  const post = await prisma.post.findFirst({
    where: { id, workspaceId },
    include: {
      socialAccount: true,
      media: { include: { media: true } },
    },
  });
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/posts">
          <Button variant="ghost" size="sm">← Posts</Button>
        </Link>
      </div>
      <PostDetailClient post={post} workspaceId={workspaceId} />
    </div>
  );
}
