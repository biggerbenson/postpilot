"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Loader2 } from "lucide-react";

type Workspace = { id: string; name: string };

type Post = {
  id: string;
  workspaceId: string;
  caption: string;
  platform: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  socialAccount: { accountName: string };
};

export function PostsList({ workspaces }: { workspaces: Workspace[] }) {
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!workspaceId) {
      setPosts([]);
      return;
    }
    setLoading(true);
    const url = statusFilter === "all"
      ? `/api/workspaces/${workspaceId}/posts`
      : `/api/workspaces/${workspaceId}/posts?status=${statusFilter}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [workspaceId, statusFilter]);

  if (workspaces.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Create a workspace and connect an account to create posts.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Select value={workspaceId} onValueChange={setWorkspaceId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {workspaces.map((w) => (
              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PENDING_APPROVAL">Pending approval</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Link href={`/posts/schedule?workspaceId=${workspaceId}`}>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Create schedule
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No posts yet. Create a schedule or add a post manually.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}?workspaceId=${post.workspaceId}`}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{post.caption.slice(0, 80)}...</p>
                    <p className="text-sm text-muted-foreground">
                      {post.platform} · {post.socialAccount.accountName} · {post.status}
                      {post.scheduledAt && ` · ${new Date(post.scheduledAt).toLocaleString()}`}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-muted capitalize">
                    {post.status.toLowerCase().replace("_", " ")}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
