"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Video, Loader2 } from "lucide-react";

type Asset = {
  id: string;
  fileName: string;
  fileUrl: string | null;
  mimeType: string;
  fileSize: number;
  mediaType: string;
  altCaption: string | null;
  tags: string[];
  campaignNotes: string | null;
};

export function MediaDetailClient({
  asset,
  workspaceId,
}: {
  asset: Asset;
  workspaceId: string;
}) {
  const [altCaption, setAltCaption] = useState(asset.altCaption ?? "");
  const [tagsStr, setTagsStr] = useState(asset.tags.join(", "));
  const [campaignNotes, setCampaignNotes] = useState(asset.campaignNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/media/${asset.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            altCaption: altCaption || undefined,
            tags: tagsStr ? tagsStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
            campaignNotes: campaignNotes || undefined,
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
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this media? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/media/${asset.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        toast({
          title: "Error",
          description: "Failed to delete",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Deleted", variant: "success" });
      router.push("/media");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  const isImage = asset.mediaType === "IMAGE";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="p-0">
          <div className="aspect-square bg-muted flex items-center justify-center">
            {isImage && asset.fileUrl ? (
              <img
                src={asset.fileUrl}
                alt={asset.altCaption ?? asset.fileName}
                className="w-full h-full object-contain"
              />
            ) : (
              <Video className="h-24 w-24 text-muted-foreground" />
            )}
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{asset.fileName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {(asset.fileSize / 1024).toFixed(1)} KB · {asset.mediaType}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Alt / caption note</Label>
              <Input
                value={altCaption}
                onChange={(e) => setAltCaption(e.target.value)}
                placeholder="Brief description for AI and accessibility"
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="product, campaign, summer"
              />
            </div>
            <div className="space-y-2">
              <Label>Campaign notes</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={campaignNotes}
                onChange={(e) => setCampaignNotes(e.target.value)}
                placeholder="Optional notes for AI generation"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
