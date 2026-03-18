"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

type Post = {
  id: string;
  caption: string;
  shortCaption: string | null;
  headline: string | null;
  cta: string | null;
  hashtags: string | null;
  platform: string;
  status: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  errorMessage: string | null;
  socialAccount: { accountName: string };
  media: { media: { fileName: string; fileUrl: string | null; mediaType: string } }[];
};

export function PostDetailClient({
  post,
  workspaceId,
}: {
  post: Post;
  workspaceId: string;
}) {
  const [caption, setCaption] = useState(post.caption);
  const [scheduledAt, setScheduledAt] = useState(
    post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : ""
  );
  const [status, setStatus] = useState(post.status);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/posts/${post.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caption,
            scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
            status,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.message ?? "Failed to save",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Saved", variant: "success" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    setApproving(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/posts/${post.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "APPROVED" }),
        }
      );
      if (!res.ok) {
        toast({
          title: "Error",
          description: "Failed to approve",
          variant: "destructive",
        });
        return;
      }
      setStatus("APPROVED");
      toast({ title: "Approved", variant: "success" });
      router.refresh();
    } finally {
      setApproving(false);
    }
  }

  async function handleSchedule() {
    if (!scheduledAt) {
      toast({
        title: "Set a date/time first",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/posts/${post.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "SCHEDULED",
            scheduledAt: new Date(scheduledAt).toISOString(),
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.message ?? "Failed to schedule",
          variant: "destructive",
        });
        return;
      }
      setStatus("SCHEDULED");
      toast({ title: "Scheduled", variant: "success" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Post</CardTitle>
          <p className="text-sm text-muted-foreground">
            {post.platform} · {post.socialAccount.accountName} · {post.status}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Caption</Label>
            <textarea
              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Scheduled at</Label>
            <input
              type="datetime-local"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
            {post.status === "PENDING_APPROVAL" && (
              <Button variant="secondary" onClick={handleApprove} disabled={approving}>
                {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
              </Button>
            )}
            {(post.status === "DRAFT" || post.status === "APPROVED") && (
              <Button variant="outline" onClick={handleSchedule} disabled={saving}>
                Schedule
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Status:</span> {post.status}</p>
          {post.scheduledAt && (
            <p><span className="text-muted-foreground">Scheduled:</span> {new Date(post.scheduledAt).toLocaleString()}</p>
          )}
          {post.publishedAt && (
            <p><span className="text-muted-foreground">Published:</span> {new Date(post.publishedAt).toLocaleString()}</p>
          )}
          {post.errorMessage && (
            <p className="text-destructive"><span className="text-muted-foreground">Error:</span> {post.errorMessage}</p>
          )}
          {post.media.length > 0 && (
            <p><span className="text-muted-foreground">Media:</span> {post.media.map((m) => m.media.fileName).join(", ")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
