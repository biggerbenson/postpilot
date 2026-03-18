"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

type Workspace = { id: string; name: string };
type Account = { id: string; platform: string; accountName: string };
type Media = { id: string; fileName: string };

const PLATFORMS = ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X", "TIKTOK"] as const;

export function ScheduleForm({
  workspaces,
  accounts,
  media,
  defaultWorkspaceId,
}: {
  workspaces: Workspace[];
  accounts: Account[];
  media: Media[];
  defaultWorkspaceId: string;
}) {
  const [workspaceId, setWorkspaceId] = useState(defaultWorkspaceId);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(
    accounts[0]?.id ? [accounts[0].id] : []
  );
  const [durationDays, setDurationDays] = useState(7);
  const [frequency, setFrequency] = useState<"daily" | "weekdays" | "custom">("weekdays");
  const [timesStr, setTimesStr] = useState("09:00, 14:00");
  const [approvalMode, setApprovalMode] = useState<"MANUAL" | "AUTO">("MANUAL");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    PLATFORMS[0],
  ]);
  const [autoGenerateImages, setAutoGenerateImages] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const times = timesStr.split(",").map((t) => t.trim()).filter((t) => /^\d{2}:\d{2}$/.test(t));
  const toggleMedia = (id: string) => {
    setSelectedMediaIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleAccount = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const togglePlatform = (value: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(value)
        ? prev.filter((p) => p !== value)
        : [...prev, value]
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !workspaceId ||
      selectedAccountIds.length === 0 ||
      selectedPlatforms.length === 0 ||
      selectedMediaIds.length === 0 ||
      times.length === 0
    ) {
      toast({
        title: "Missing fields",
        description:
          "Select workspace, at least one social account, at least one platform, media, and times.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          socialAccountIds: selectedAccountIds,
          durationDays,
          frequency,
          times,
          approvalMode,
          platforms: selectedPlatforms,
          mediaIds: selectedMediaIds,
          autoGenerateImages,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Error",
          description: data.message ?? "Failed to create schedule",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Schedule created",
        description: `${data.created} posts created`,
        variant: "success",
      });
      router.push("/posts");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (workspaces.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Create a workspace first.
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Connect at least one social account in Accounts for this workspace.
        </CardContent>
      </Card>
    );
  }

  if (media.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Upload media in Media library first.
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Schedule plan</CardTitle>
          <CardDescription>Duration, frequency, and posting times</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Workspace</Label>
              <Select value={workspaceId} onValueChange={setWorkspaceId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Social accounts</Label>
              <p className="text-xs text-muted-foreground">
                Choose one or more accounts where posts should be published.
              </p>
              <div className="flex flex-wrap gap-2">
                {accounts.map((a) => (
                  <Button
                    key={a.id}
                    type="button"
                    size="sm"
                    variant={
                      selectedAccountIds.includes(a.id)
                        ? "default"
                        : "outline"
                    }
                    onClick={() => toggleAccount(a.id)}
                  >
                    {a.platform} – {a.accountName}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v: "daily" | "weekdays" | "custom") => setFrequency(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="custom">Custom days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Posting times (comma-separated, e.g. 09:00, 14:00)</Label>
            <Input
              value={timesStr}
              onChange={(e) => setTimesStr(e.target.value)}
              placeholder="09:00, 14:00"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Approval mode</Label>
              <Select value={approvalMode} onValueChange={(v: "MANUAL" | "AUTO") => setApprovalMode(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Manual approval</SelectItem>
                  <SelectItem value="AUTO">Auto-publish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Platforms</Label>
              <p className="text-xs text-muted-foreground">
                Select which platforms this schedule should target.
              </p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <Button
                    key={p}
                    type="button"
                    size="sm"
                    variant={
                      selectedPlatforms.includes(p) ? "default" : "outline"
                    }
                    onClick={() => togglePlatform(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Select media (used in rotation)</Label>
            <div className="flex flex-wrap gap-2">
              {media.map((m) => (
                <Button
                  key={m.id}
                  type="button"
                  variant={selectedMediaIds.includes(m.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleMedia(m.id)}
                >
                  {m.fileName}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Auto-generate images</Label>
            <p className="text-xs text-muted-foreground">
              When enabled, posts will be marked to auto-generate images from
              selected media (MVP placeholder: flag stored on posts).
            </p>
            <Button
              type="button"
              variant={autoGenerateImages ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoGenerateImages((prev) => !prev)}
            >
              {autoGenerateImages ? "Enabled" : "Disabled"}
            </Button>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create schedule
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
