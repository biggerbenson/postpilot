"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { PlanConfig } from "@/lib/subscriptions/plans";

const PAYMENT_PROVIDERS = [
  {
    id: "pesapal",
    name: "Pesapal",
    logoSrc: "/payments/pesapal.png",
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    logoSrc: "/payments/flutterwave.png",
  },
  {
    id: "paypal",
    name: "PayPal",
    logoSrc: "/payments/paypal.png",
  },
  {
    id: "stripe",
    name: "Stripe",
    logoSrc: "/payments/stripe.png",
  },
  {
    id: "paystack",
    name: "Paystack",
    logoSrc: "/payments/paystack.png",
  },
] as const;

export function BillingPageClient() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<{
    entitlements: {
      subscription: { plan: string; currentPeriodStart: string; currentPeriodEnd: string };
      usage: { aiGenerations: number; regenerations: number };
      counts: { socialAccountsUsed: number; brandProfilesUsed: number };
    };
    plan: PlanConfig;
    allPlans: PlanConfig[];
  } | null>(null);

  const currentPlan = me?.plan;
  const allPlans = useMemo(() => me?.allPlans ?? [], [me?.allPlans]);

  function handleRenew() {
    toast({
      title: "Renewal flow",
      description:
        "This is where you will integrate your subscription billing provider (e.g. Stripe Billing) to renew or upgrade plans.",
    });
  }

  function handleConnect(id: string) {
    const provider = PAYMENT_PROVIDERS.find((p) => p.id === id);
    toast({
      title: `Connect ${provider?.name ?? "provider"}`,
      description:
        "This will open a real payment-authorization flow in production (redirect or hosted checkout). For now, it is a placeholder.",
    });
  }

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/me");
      const data = await res.json();
      setMe(res.ok ? data : null);
    } finally {
      setLoading(false);
    }
  }

  async function setPlan(plan: string) {
    const res = await fetch("/api/billing/set-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast({
        title: "Upgrade failed",
        description: data.message ?? "Try again",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Plan updated (simulated)", variant: "success" });
    await refresh();
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usagePct =
    currentPlan && me
      ? Math.min(100, Math.round((me.entitlements.usage.aiGenerations / currentPlan.limits.aiPostsPerPeriod) * 100))
      : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Manage your plan and renew your subscription.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Current plan:{" "}
              <span className="font-semibold">
                {loading ? "Loading..." : currentPlan?.label ?? "Unknown"}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {me?.entitlements?.subscription?.currentPeriodEnd ? (
                <>
                  Period ends{" "}
                  {new Date(me.entitlements.subscription.currentPeriodEnd).toLocaleDateString()}.
                  Billing is currently simulated; wire this into your provider when you go live.
                </>
              ) : (
                "Billing is currently simulated; wire this into your provider when you go live."
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRenew}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Renew / upgrade
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentPlan && me && (
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Track your monthly usage and limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>AI generations</span>
                <span className="text-muted-foreground">
                  {me.entitlements.usage.aiGenerations} / {currentPlan.limits.aiPostsPerPeriod}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${usagePct}%` }}
                />
              </div>
              {currentPlan.features.canRegenerate && (
                <p className="text-xs text-muted-foreground">
                  Regenerations used: {me.entitlements.usage.regenerations}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium">Social accounts</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {me.entitlements.counts.socialAccountsUsed} / {currentPlan.limits.socialAccounts}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium">Brand profiles (workspaces)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {me.entitlements.counts.brandProfilesUsed} / {currentPlan.limits.brandProfiles}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
          <CardDescription>
            Choose a plan. This is a simulated upgrade until you connect a payment provider.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {allPlans.map((p) => {
              const isCurrent = currentPlan?.name === p.name;
              return (
                <div key={p.name} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{p.label}</p>
                    {isCurrent && (
                      <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-1">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-semibold">
                    ${p.priceUsdMonthly}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>AI generations: {p.limits.aiPostsPerPeriod.toLocaleString()}/mo</p>
                    <p>Social accounts: {p.limits.socialAccounts.toLocaleString()}</p>
                    <p>Schedule window: {p.limits.scheduleDays >= 3650 ? "Unlimited" : `${p.limits.scheduleDays} days`}</p>
                    <p>Long captions: {p.features.canUseLongCaptions ? "Yes" : "No"}</p>
                    <p>Regenerate: {p.features.canRegenerate ? "Yes" : "No"}</p>
                  </div>
                  <Button
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || loading}
                    onClick={() => setPlan(p.name)}
                    className="mt-2"
                  >
                    {isCurrent ? "Current plan" : "Switch to this plan"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pay with</CardTitle>
          <CardDescription>
            Choose a payment processor. Each option will use its official
            checkout or authorization flow in production.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PAYMENT_PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleConnect(p.id)}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border px-3 py-4 hover:bg-accent transition-colors"
              >
                <div className="relative h-8 w-32">
                  <Image
                    src={p.logoSrc}
                    alt={p.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  Pay with {p.name}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

