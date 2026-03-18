"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { Upload, Image as ImageIcon, Video, Loader2 } from "lucide-react";

type MediaAsset = {
  id: string;
  workspaceId: string;
  fileName: string;
  fileUrl: string | null;
  mimeType: string;
  fileSize: number;
  mediaType: string;
  altCaption: string | null;
  tags: string[];
  campaignNotes: string | null;
  createdAt: string;
};

export function MediaLibrary({
  workspaces,
}: {
  workspaces: { id: string; name: string }[];
}) {
  const [workspaceId, setWorkspaceId] = useState<string>(workspaces[0]?.id ?? "");
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!workspaceId) {
      setMedia([]);
      return;
    }
    setLoading(true);
    fetch(`/api/workspaces/${workspaceId}/media`)
      .then((r) => r.json())
      .then((data) => {
        setMedia(Array.isArray(data) ? data : []);
      })
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !workspaceId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch(`/api/workspaces/${workspaceId}/media`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Upload failed",
          description: data.message ?? "Invalid file or size",
          variant: "destructive",
        });
        return;
      }
      setMedia((prev) => [data, ...prev]);
      setUploadKey((k) => k + 1);
      toast({ title: "Uploaded", variant: "success" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (workspaces.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
        Create a workspace first to upload media.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={workspaceId}
          onValueChange={setWorkspaceId}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select workspace" />
          </SelectTrigger>
          <SelectContent>
            {workspaces.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          key={uploadKey}
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
          onChange={handleUpload}
          disabled={uploading}
        />
        <Button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Upload
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : media.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No media yet</p>
            <Button
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload image or video
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {media.map((m) => (
            <Card
              key={m.id}
              className="overflow-hidden cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => router.push(`/media/${m.id}?workspaceId=${workspaceId}`)}
            >
              <div className="aspect-square bg-muted relative">
                {m.mediaType === "IMAGE" ? (
                  <img
                    src={m.fileUrl ?? "#"}
                    alt={m.altCaption ?? m.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="p-2">
                <p className="text-xs font-medium truncate" title={m.fileName}>
                  {m.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(m.fileSize / 1024).toFixed(1)} KB
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
