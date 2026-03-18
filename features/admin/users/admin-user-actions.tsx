"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function AdminUserActions({
  userId,
  currentRole,
  suspended,
  currentPlan,
}: {
  userId: string;
  currentRole: "USER" | "ADMIN" | "SUPER_ADMIN";
  suspended: boolean;
  currentPlan: string;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function patch(body: any) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: "Action failed",
          description: data.message ?? "Try again",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Updated", variant: "success" });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        disabled={loading}
        onClick={() => patch({ suspended: !suspended })}
      >
        {suspended ? "Unsuspend" : "Suspend"}
      </Button>

      <Button
        variant="outline"
        disabled={loading || currentRole === "ADMIN"}
        onClick={() => patch({ role: "ADMIN" })}
      >
        Make admin
      </Button>
      <Button
        variant="outline"
        disabled={loading || currentRole === "USER"}
        onClick={() => patch({ role: "USER" })}
      >
        Make user
      </Button>

      <Button
        disabled={loading}
        onClick={() => patch({ plan: currentPlan === "PRO" ? "STARTER" : "PRO" })}
      >
        Toggle plan (Pro/Starter)
      </Button>
    </div>
  );
}

