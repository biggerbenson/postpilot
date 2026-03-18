import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { assertWorkspaceAccess } from "@/server/services/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaDetailClient } from "@/features/media/media-detail-client";

export default async function MediaDetailPage({
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
  if (!workspaceId) redirect("/media");

  try {
    await assertWorkspaceAccess(workspaceId, user.id);
  } catch {
    notFound();
  }

  const asset = await prisma.mediaAsset.findFirst({
    where: { id, workspaceId },
  });
  if (!asset) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/media">
          <Button variant="ghost" size="sm">← Media</Button>
        </Link>
      </div>
      <MediaDetailClient asset={asset} workspaceId={workspaceId} />
    </div>
  );
}
