"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Link2,
  Loader2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  PlayCircle,
  Pencil,
  Trash2,
} from "lucide-react";

type Workspace = { id: string; name: string };

type Account = {
  id: string;
  platform: string;
  accountName: string;
  accountId: string | null;
  status: string;
};

const PLATFORMS = ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X", "TIKTOK"] as const;
type PlatformValue = (typeof PLATFORMS)[number];

const PLATFORM_META: Record<
  PlatformValue,
  {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    className: string;
  }
> = {
  INSTAGRAM: {
    label: "Instagram",
    icon: Instagram,
    className:
      "bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-400 text-white",
  },
  FACEBOOK: {
    label: "Facebook",
    icon: Facebook,
    className: "bg-[#1877F2] text-white",
  },
  LINKEDIN: {
    label: "LinkedIn",
    icon: Linkedin,
    className: "bg-[#0A66C2] text-white",
  },
  X: {
    label: "X (Twitter)",
    icon: Twitter,
    className: "bg-black text-white",
  },
  TIKTOK: {
    label: "TikTok",
    icon: PlayCircle,
    className: "bg-[#010101] text-white",
  },
};

export function ConnectedAccounts({
  workspaces,
}: {
  workspaces: Workspace[];
}) {
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [platform, setPlatform] = useState<PlatformValue>(PLATFORMS[0]);
  const [accountName, setAccountName] = useState("");
  const [connectingPlatform, setConnectingPlatform] =
    useState<PlatformValue | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!workspaceId) {
      setAccounts([]);
      return;
    }
    setLoading(true);
    fetch(`/api/workspaces/${workspaceId}/accounts`)
      .then((r) => r.json())
      .then((data) => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!accountName.trim() || !workspaceId) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          platform,
          accountName: accountName.trim(),
          status: "PENDING",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Error",
          description: data.message ?? "Failed to add",
          variant: "destructive",
        });
        return;
      }
      setAccounts((prev) => [data, ...prev]);
      setAccountName("");
      toast({ title: "Account added", variant: "success" });
    } finally {
      setAdding(false);
    }
  }

  async function handleConnect(platform: PlatformValue) {
    if (!workspaceId) {
      toast({
        title: "Select a workspace first",
        variant: "destructive",
      });
      return;
    }

    const meta = PLATFORM_META[platform];
    const confirmed = window.confirm(
      `Connect a ${meta.label} account to this workspace? (Mock OAuth flow)`
    );
    if (!confirmed) return;

    setConnectingPlatform(platform);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/accounts/oauth`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Connection failed",
          description: data.message ?? "Unable to connect account",
          variant: "destructive",
        });
        return;
      }
      setAccounts((prev) => [data, ...prev]);
      toast({
        title: "Account connected",
        description: `${meta.label} account is now connected (mock OAuth).`,
        variant: "success",
      });
    } finally {
      setConnectingPlatform(null);
    }
  }

  async function handleEdit(account: Account) {
    const name = window.prompt(
      "Update account label",
      account.accountName ?? ""
    );
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === account.accountName) return;
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/accounts/${account.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountName: trimmed }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Update failed",
          description: data.message ?? "Unable to update account",
          variant: "destructive",
        });
        return;
      }
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? data : a))
      );
      toast({
        title: "Account updated",
        variant: "success",
      });
    } catch {
      toast({
        title: "Update failed",
        description: "Network error",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(account: Account) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the ${account.accountName} (${account.platform}) connection?`
    );
    if (!confirmed) return;
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/accounts/${account.id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: "Delete failed",
          description: data.message ?? "Unable to delete account",
          variant: "destructive",
        });
        return;
      }
      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
      toast({
        title: "Account deleted",
        variant: "success",
      });
    } catch {
      toast({
        title: "Delete failed",
        description: "Network error",
        variant: "destructive",
      });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={workspaceId} onValueChange={setWorkspaceId}>
          <SelectTrigger className="w-[220px]">
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

      <Card>
        <CardHeader>
          <CardTitle>Connect via OAuth (mock)</CardTitle>
          <CardDescription>
            Click a platform button to simulate an OAuth connection. This
            creates a connected account with mock tokens so you can wire the
            publishing engine without real provider keys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((p) => {
              const meta = PLATFORM_META[p];
              const Icon = meta.icon;
              const isConnecting = connectingPlatform === p;
              return (
                <Button
                  key={p}
                  type="button"
                  onClick={() => handleConnect(p)}
                  disabled={!!connectingPlatform}
                  className={`rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 ${meta.className}`}
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span>{meta.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add account (manual placeholder)</CardTitle>
          <CardDescription>
            Use this only when you want to create a placeholder account without
            going through OAuth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAdd}
            className="flex flex-wrap items-end gap-4"
          >
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={platform}
                onValueChange={(v: PlatformValue) => setPlatform(v)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Account name</Label>
              <Input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. @mybrand"
                className="w-[200px]"
              />
            </div>
            <Button type="submit" disabled={adding}>
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>
            Connected accounts for this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <p className="text-muted-foreground py-4">
              No accounts yet. Connect one above.
            </p>
          ) : (
            <ul className="space-y-2">
              {accounts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-4 py-2 border-b last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {a.accountName || PLATFORM_META[a.platform as PlatformValue]?.label || a.platform}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.platform} · {a.status.toLowerCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(a)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(a)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

