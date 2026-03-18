"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

type SettingRow = {
  group: string;
  key: string;
  valueJson: any;
  isSecret: boolean;
  hasSecretValue: boolean;
};

function normalizeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function AdminSettingsForm({
  group,
  title,
  description,
  fields,
}: {
  group: string;
  title: string;
  description: string;
  fields: Array<
    | { key: string; label: string; type: "text" | "number" | "url" }
    | { key: string; label: string; type: "secret" }
    | { key: string; label: string; type: "json" }
  >;
}) {
  const { toast } = useToast();
  const [rows, setRows] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const map = useMemo(() => {
    const m = new Map(rows.map((r) => [r.key, r]));
    return m;
  }, [rows]);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/settings/${group}`);
      const data = await res.json();
      setRows(res.ok ? data.settings : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  async function saveValue(key: string, valueJson: any) {
    setSavingKey(key);
    try {
      const res = await fetch(`/api/admin/settings/${group}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, valueJson }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: "Save failed", description: data.message ?? "Try again", variant: "destructive" });
        return;
      }
      toast({ title: "Saved", variant: "success" });
      await refresh();
    } finally {
      setSavingKey(null);
    }
  }

  async function saveSecret(key: string, secretValue: string) {
    setSavingKey(key);
    try {
      const res = await fetch(`/api/admin/settings/${group}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, secretValue }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: "Save failed", description: data.message ?? "Try again", variant: "destructive" });
        return;
      }
      toast({ title: "Secret saved", variant: "success" });
      await refresh();
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Loading…</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {fields.map((f) => {
          const existing = map.get(f.key);
          const isSaving = savingKey === f.key;
          const defaultValue =
            f.type === "json"
              ? JSON.stringify(existing?.valueJson ?? {}, null, 2)
              : f.type === "secret"
                ? ""
                : String(existing?.valueJson ?? "");

          return (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              {f.type === "secret" ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    type="password"
                    placeholder={existing?.hasSecretValue ? "•••••••• (set)" : "Enter value"}
                    defaultValue=""
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const v = (e.target as HTMLInputElement).value;
                        if (!v) return;
                        saveSecret(f.key, v);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={(e) => {
                      const input = (e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement) ?? null;
                      const v = input?.value ?? "";
                      if (!v) return;
                      saveSecret(f.key, v);
                    }}
                  >
                    Save secret
                  </Button>
                </div>
              ) : f.type === "json" ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full min-h-[120px] rounded-md border bg-background p-3 text-sm font-mono"
                    defaultValue={defaultValue}
                    onBlur={(e) => saveValue(f.key, normalizeJson(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    JSON is saved on blur. Keep it valid JSON.
                  </p>
                </div>
              ) : (
                <Input
                  type={f.type}
                  defaultValue={defaultValue}
                  onBlur={(e) => saveValue(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

