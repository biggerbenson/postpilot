"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";

type InitialValues = {
  timezone: string;
  defaultApprovalMode: string;
  defaultPostingFrequency: string;
  defaultPostingTimes: string;
  notificationsEnabled: boolean;
  notifyOnPostPublished: boolean;
  notifyOnPostFailed: boolean;
  notifyOnApprovalRequired: boolean;
  notifyOnAccountDisconnected: boolean;
};

export function SettingsForm({
  userId,
  initialValues,
}: {
  userId: string;
  initialValues: InitialValues;
}) {
  const [timezone, setTimezone] = useState(initialValues.timezone);
  const [defaultApprovalMode, setDefaultApprovalMode] = useState(
    initialValues.defaultApprovalMode
  );
  const [defaultPostingFrequency, setDefaultPostingFrequency] = useState(
    initialValues.defaultPostingFrequency
  );
  const [defaultPostingTimes, setDefaultPostingTimes] = useState(
    initialValues.defaultPostingTimes
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    initialValues.notificationsEnabled
  );
  const [notifyOnPostPublished, setNotifyOnPostPublished] = useState(
    initialValues.notifyOnPostPublished
  );
  const [notifyOnPostFailed, setNotifyOnPostFailed] = useState(
    initialValues.notifyOnPostFailed
  );
  const [notifyOnApprovalRequired, setNotifyOnApprovalRequired] = useState(
    initialValues.notifyOnApprovalRequired
  );
  const [notifyOnAccountDisconnected, setNotifyOnAccountDisconnected] = useState(
    initialValues.notifyOnAccountDisconnected
  );
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timezone,
          defaultApprovalMode: defaultApprovalMode || "MANUAL",
          defaultPostingFrequency: defaultPostingFrequency || null,
          defaultPostingTimes: defaultPostingTimes || null,
          notificationsEnabled,
          notifyOnPostPublished,
          notifyOnPostFailed,
          notifyOnApprovalRequired,
          notifyOnAccountDisconnected,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.message ?? "Failed to save",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
        variant: "success",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Default timezone and posting behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="UTC"
            />
          </div>
          <div className="space-y-2">
            <Label>Default approval mode</Label>
            <Select
              value={defaultApprovalMode}
              onValueChange={setDefaultApprovalMode}
            >
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
            <Label>Default posting frequency</Label>
            <Input
              value={defaultPostingFrequency}
              onChange={(e) =>
                setDefaultPostingFrequency(e.target.value)
              }
              placeholder="e.g. daily, 3x/week"
            />
          </div>
          <div className="space-y-2">
            <Label>Default posting times</Label>
            <Input
              value={defaultPostingTimes}
              onChange={(e) =>
                setDefaultPostingTimes(e.target.value)
              }
              placeholder='e.g. 09:00, 14:00 or ["09:00","14:00"]'
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Control what you get notified about in your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label>Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Turn off to disable all account notifications.
              </p>
            </div>
            <Button
              type="button"
              variant={notificationsEnabled ? "default" : "outline"}
              onClick={() => setNotificationsEnabled((v) => !v)}
            >
              {notificationsEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant={notifyOnPostPublished ? "default" : "outline"}
              onClick={() => setNotifyOnPostPublished((v) => !v)}
              disabled={!notificationsEnabled}
            >
              Post published
            </Button>
            <Button
              type="button"
              variant={notifyOnPostFailed ? "default" : "outline"}
              onClick={() => setNotifyOnPostFailed((v) => !v)}
              disabled={!notificationsEnabled}
            >
              Post failed
            </Button>
            <Button
              type="button"
              variant={notifyOnApprovalRequired ? "default" : "outline"}
              onClick={() => setNotifyOnApprovalRequired((v) => !v)}
              disabled={!notificationsEnabled}
            >
              Approval required
            </Button>
            <Button
              type="button"
              variant={notifyOnAccountDisconnected ? "default" : "outline"}
              onClick={() => setNotifyOnAccountDisconnected((v) => !v)}
              disabled={!notificationsEnabled}
            >
              Account disconnected
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Delivery (in-app/email/push) will follow your account configuration when enabled.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Save</CardTitle>
          <CardDescription>Save your settings changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

