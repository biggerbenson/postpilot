"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, Loader2 } from "lucide-react";
import type { AiCaptionOutput } from "@/types";
import Link from "next/link";

type Workspace = {
  id: string;
  name: string;
  brandProfile: unknown;
};

type MediaAsset = {
  id: string;
  fileName: string;
  fileUrl: string | null;
  mediaType: string;
};

const PLATFORMS = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "X", label: "X (Twitter)" },
  { value: "TIKTOK", label: "TikTok" },
] as const;

export function ContentGenerator({
  workspaces,
}: {
  workspaces: Workspace[];
}) {
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [selectedMediaId, setSelectedMediaId] = useState<string>("");
  const [platform, setPlatform] = useState<string>("INSTAGRAM");
  const [captionLength, setCaptionLength] = useState<"short" | "long">("short");
  const [result, setResult] = useState<AiCaptionOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [ent, setEnt] = useState<{
    plan?: { name: string; features: { canUseLongCaptions: boolean; canRegenerate: boolean } };
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/billing/me")
      .then((r) => r.json())
      .then((d) => setEnt(d))
      .catch(() => setEnt(null));
  }, []);

  useEffect(() => {
    if (!workspaceId) {
      setMediaList([]);
      setSelectedMediaId("");
      return;
    }
    setLoadingMedia(true);
    fetch(`/api/workspaces/${workspaceId}/media`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setMediaList(list);
        setSelectedMediaId(list[0]?.id ?? "");
      })
      .catch(() => setMediaList([]))
      .finally(() => setLoadingMedia(false));
  }, [workspaceId]);

  async function handleGenerate() {
    if (!selectedMediaId || !workspaceId) {
      toast({
        title: "Select workspace and media",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          mediaId: selectedMediaId,
          platform,
          captionLength,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "UPGRADE_REQUIRED") {
          toast({
            title: "Upgrade required",
            description: data.message ?? "Upgrade to unlock this feature",
            action: (
              <Link href="/billing" className="underline">
                View plans
              </Link>
            ),
          });
          return;
        }
        toast({
          title: "Generation failed",
          description: data.message ?? "Try again",
          variant: "destructive",
        });
        return;
      }
      setResult(data);
      toast({ title: "Caption generated", variant: "success" });
    } finally {
      setLoading(false);
    }
  }

  if (workspaces.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Create a workspace and add media first.
        </CardContent>
      </Card>
    );
  }

  const selectedMedia = mediaList.find((m) => m.id === selectedMediaId);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>
            Choose workspace, media, and platform for AI caption
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Workspace</Label>
            <Select value={workspaceId} onValueChange={setWorkspaceId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Media</Label>
            <Select
              value={selectedMediaId}
              onValueChange={setSelectedMediaId}
              disabled={loadingMedia}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select media" />
              </SelectTrigger>
              <SelectContent>
                {mediaList.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.fileName} ({m.mediaType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Caption length</Label>
            <Select
              value={captionLength}
              onValueChange={(v) => setCaptionLength(v as "short" | "long")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem
                  value="long"
                  disabled={ent?.plan?.features?.canUseLongCaptions === false}
                >
                  Long (Pro+)
                </SelectItem>
              </SelectContent>
            </Select>
            {ent?.plan?.features?.canUseLongCaptions === false && captionLength === "long" && (
              <p className="text-xs text-muted-foreground">
                Long captions require Pro.{" "}
                <Link href="/billing" className="underline">
                  Upgrade
                </Link>
              </p>
            )}
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading || !selectedMediaId}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate caption
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
          <CardDescription>
            Generated caption and metadata
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4 text-sm">
              {result.title && (
                <div>
                  <Label className="text-muted-foreground">Title</Label>
                  <p className="mt-1 font-medium">{result.title}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Caption</Label>
                <p className="mt-1 whitespace-pre-wrap">{result.mainCaption}</p>
              </div>
              {result.shortCaption && (
                <div>
                  <Label className="text-muted-foreground">Short caption</Label>
                  <p className="mt-1">{result.shortCaption}</p>
                </div>
              )}
              {result.cta && (
                <div>
                  <Label className="text-muted-foreground">CTA</Label>
                  <p className="mt-1">{result.cta}</p>
                </div>
              )}
              {result.hashtags && result.hashtags.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Hashtags</Label>
                  <p className="mt-1">{result.hashtags.join(" ")}</p>
                </div>
              )}
              {result.platformNotes && (
                <div>
                  <Label className="text-muted-foreground">Platform notes</Label>
                  <p className="mt-1 text-muted-foreground">{result.platformNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Select media and click Generate to see the caption here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
