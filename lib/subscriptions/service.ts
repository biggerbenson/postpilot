import type { PlanName } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getMonthlyPeriodFrom } from "@/lib/subscriptions/period";
import { getPlanConfig } from "@/lib/subscriptions/plans";
import type { Entitlements } from "@/lib/subscriptions/types";

function nowUtc() {
  return new Date();
}

export async function ensureSubscription(userId: string) {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing) return existing;

  const { periodStart, periodEnd } = getMonthlyPeriodFrom(nowUtc());
  const plan = "FREE" as PlanName;
  const cfg = getPlanConfig(plan);

  return prisma.subscription.create({
    data: {
      userId,
      plan,
      status: "ACTIVE",
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      priceCents: Math.round(cfg.priceUsdMonthly * 100),
      interval: cfg.interval,
    },
  });
}

export async function ensureUsageRecord(userId: string, periodStart: Date, periodEnd: Date) {
  const existing = await prisma.usageRecord.findUnique({
    where: { userId_periodStart: { userId, periodStart } },
  });
  if (existing) return existing;
  return prisma.usageRecord.create({
    data: { userId, periodStart, periodEnd },
  });
}

/**
 * Lazy monthly reset: if the subscription period has ended, we roll forward the
 * subscription period and start a fresh usage record.
 */
export async function ensureCurrentBillingPeriod(userId: string) {
  const sub = await ensureSubscription(userId);
  const now = nowUtc();

  if (sub.currentPeriodEnd > now) {
    const usage = await ensureUsageRecord(userId, sub.currentPeriodStart, sub.currentPeriodEnd);
    return { sub, usage, rolled: false };
  }

  // roll forward to a new monthly period
  const { periodStart, periodEnd } = getMonthlyPeriodFrom(now);
  const cfg = getPlanConfig(sub.plan);
  const updated = await prisma.subscription.update({
    where: { userId },
    data: {
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      priceCents: Math.round(cfg.priceUsdMonthly * 100),
      interval: cfg.interval,
    },
  });
  const usage = await ensureUsageRecord(userId, periodStart, periodEnd);
  return { sub: updated, usage, rolled: true };
}

export async function getEntitlements(userId: string): Promise<Entitlements> {
  const { sub, usage } = await ensureCurrentBillingPeriod(userId);

  const [socialAccountsUsed, brandProfilesUsed] = await Promise.all([
    prisma.socialAccount.count({
      where: { workspace: { ownerId: userId } },
    }),
    prisma.workspace.count({
      where: { ownerId: userId, deletedAt: null },
    }),
  ]);

  return {
    subscription: {
      plan: sub.plan,
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart.toISOString(),
      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    },
    usage: {
      periodStart: usage.periodStart.toISOString(),
      periodEnd: usage.periodEnd.toISOString(),
      aiGenerations: usage.aiGenerations,
      regenerations: usage.regenerations,
    },
    counts: {
      socialAccountsUsed,
      brandProfilesUsed,
      teamMembersUsed: 1, // placeholder until team model exists
    },
  };
}

export async function incrementAiGeneration(userId: string, opts?: { isRegeneration?: boolean }) {
  const { sub, usage } = await ensureCurrentBillingPeriod(userId);
  const cfg = getPlanConfig(sub.plan);

  // apply plan usage limit
  if (usage.aiGenerations >= cfg.limits.aiPostsPerPeriod) {
    return { ok: false as const, reason: "limit_reached" as const, sub, usage, cfg };
  }

  const updated = await prisma.usageRecord.update({
    where: { id: usage.id },
    data: {
      aiGenerations: { increment: 1 },
      regenerations: opts?.isRegeneration ? { increment: 1 } : undefined,
    },
  });

  return { ok: true as const, sub, usage: updated, cfg };
}

export async function setPlanSimulated(userId: string, plan: PlanName) {
  const { periodStart, periodEnd } = getMonthlyPeriodFrom(nowUtc());
  const cfg = getPlanConfig(plan);
  const sub = await ensureSubscription(userId);
  return prisma.subscription.update({
    where: { id: sub.id },
    data: {
      plan,
      status: "ACTIVE",
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      priceCents: Math.round(cfg.priceUsdMonthly * 100),
      interval: cfg.interval,
      provider: sub.provider ?? "simulated",
    },
  });
}

