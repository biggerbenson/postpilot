import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: user.id, deletedAt: null },
    include: { _count: { select: { posts: true, mediaAssets: true } } },
  });

  const totalPosts = workspaces.reduce((s, w) => s + w._count.posts, 0);
  const totalMedia = workspaces.reduce((s, w) => s + w._count.mediaAssets, 0);
  const scheduledCount = await prisma.post.count({
    where: {
      workspace: { ownerId: user.id },
      status: "SCHEDULED",
    },
  });
  const publishedCount = await prisma.post.count({
    where: {
      workspace: { ownerId: user.id },
      status: "PUBLISHED",
    },
  });

  const recentActivity = await prisma.activityLog.findMany({
    where: { workspace: { ownerId: user.id } },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { workspace: { select: { name: true } } },
  });

  const activeWorkspaces = workspaces.length;
  const avgPostsPerWorkspace =
    activeWorkspaces === 0 ? 0 : Math.round(totalPosts / activeWorkspaces);
  const scheduledVsPublishedTotal = scheduledCount + publishedCount || 1;
  const scheduledRatio = Math.round(
    (scheduledCount / scheduledVsPublishedTotal) * 100
  );
  const publishedRatio = 100 - scheduledRatio;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-muted-foreground">
            High-level snapshot of your brands, media, and posting pipeline.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/workspaces/new">
            <Button size="sm">New workspace</Button>
          </Link>
          <Link href="/media">
            <Button size="sm" variant="outline">
              Upload media
            </Button>
          </Link>
          <Link href="/posts/schedule">
            <Button size="sm" variant="outline">
              Create schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeWorkspaces}</p>
            <p className="text-xs text-muted-foreground mb-2">
              Brands currently configured in your account.
            </p>
            <Link href="/workspaces">
              <Button variant="link" className="p-0 h-auto text-xs">
                Manage workspaces
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Media assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalMedia}</p>
            <p className="text-xs text-muted-foreground mb-2">
              Images and videos ready to be turned into posts.
            </p>
            <Link href="/media">
              <Button variant="link" className="p-0 h-auto text-xs">
                Open media library
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Scheduled posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{scheduledCount}</p>
            <p className="text-xs text-muted-foreground mb-2">
              Awaiting publishing in your current queues.
            </p>
            <Link href="/posts">
              <Button variant="link" className="p-0 h-auto text-xs">
                View calendar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Published posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{publishedCount}</p>
            <p className="text-xs text-muted-foreground mb-2">
              Total posts successfully sent out from this account.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts / account glimpse */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline health</CardTitle>
            <CardDescription>
              Scheduled vs published posts across all workspaces.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Scheduled</span>
              <span>{scheduledRatio}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                style={{ width: `${scheduledRatio}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>Published</span>
              <span>{publishedRatio}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-sky-500"
                style={{ width: `${publishedRatio}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 text-xs">
              <div className="space-y-1">
                <p className="text-[0.7rem] uppercase text-muted-foreground tracking-wide">
                  Avg posts / workspace
                </p>
                <p className="text-lg font-semibold">
                  {avgPostsPerWorkspace}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[0.7rem] uppercase text-muted-foreground tracking-wide">
                  Total posts
                </p>
                <p className="text-lg font-semibold">{totalPosts}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[0.7rem] uppercase text-muted-foreground tracking-wide">
                  Workspaces
                </p>
                <p className="text-lg font-semibold">{activeWorkspaces}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest actions across your brands.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground py-4">No activity yet.</p>
            ) : (
              <ul className="space-y-2">
                {recentActivity.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between py-2 border-b last:border-0 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {log.workspace.name}:{" "}
                      {log.action.replace(/_/g, " ").toLowerCase()}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent workspaces snapshot */}
      <Card>
        <CardHeader>
          <CardTitle>Workspaces snapshot</CardTitle>
          <CardDescription>
            Quick glimpse of media and posts per workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workspaces.length === 0 ? (
            <p className="text-muted-foreground py-4">
              No workspaces yet. Create one to start uploading media and
              scheduling posts.
            </p>
          ) : (
            <ul className="space-y-2">
              {workspaces.slice(0, 6).map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <Link
                      href={`/workspaces/${w.id}`}
                      className="font-medium hover:underline"
                    >
                      {w.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {w._count.mediaAssets} media · {w._count.posts} posts
                    </p>
                  </div>
                  <Link href={`/workspaces/${w.id}`}>
                    <Button size="sm" variant="outline">
                      Open
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

