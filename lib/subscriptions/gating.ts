import type { PlanName } from "@prisma/client";
import { getPlanConfig } from "@/lib/subscriptions/plans";
import type { Entitlements } from "@/lib/subscriptions/types";

export type UpgradeRequired = {
  ok: false;
  code: "UPGRADE_REQUIRED";
  message: string;
  currentPlan: PlanName;
  requiredPlan: PlanName;
  reason:
    | "ai_limit"
    | "regenerate_not_allowed"
    | "long_caption_not_allowed"
    | "social_accounts_limit"
    | "brand_profiles_limit"
    | "schedule_window"
    | "team_members_limit";
};

export type Allowed = { ok: true };

export function canUseLongCaptions(e: Entitlements): Allowed | UpgradeRequired {
  const cfg = getPlanConfig(e.subscription.plan);
  if (cfg.features.canUseLongCaptions) return { ok: true };
  return {
    ok: false,
    code: "UPGRADE_REQUIRED",
    message: "Upgrade to Pro to generate long-form captions.",
    currentPlan: e.subscription.plan,
    requiredPlan: "PRO",
    reason: "long_caption_not_allowed",
  };
}

export function canRegenerate(e: Entitlements): Allowed | UpgradeRequired {
  const cfg = getPlanConfig(e.subscription.plan);
  if (cfg.features.canRegenerate) return { ok: true };
  return {
    ok: false,
    code: "UPGRADE_REQUIRED",
    message: "Upgrade to Pro to regenerate captions.",
    currentPlan: e.subscription.plan,
    requiredPlan: "PRO",
    reason: "regenerate_not_allowed",
  };
}

export function canCreateWorkspace(e: Entitlements): Allowed | UpgradeRequired {
  const cfg = getPlanConfig(e.subscription.plan);
  if (e.counts.brandProfilesUsed < cfg.limits.brandProfiles) return { ok: true };
  return {
    ok: false,
    code: "UPGRADE_REQUIRED",
    message: "Upgrade your plan to create more brand profiles/workspaces.",
    currentPlan: e.subscription.plan,
    requiredPlan: e.subscription.plan === "FREE" ? "STARTER" : "PRO",
    reason: "brand_profiles_limit",
  };
}

export function canConnectAnotherAccount(e: Entitlements): Allowed | UpgradeRequired {
  const cfg = getPlanConfig(e.subscription.plan);
  if (e.counts.socialAccountsUsed < cfg.limits.socialAccounts) return { ok: true };
  return {
    ok: false,
    code: "UPGRADE_REQUIRED",
    message: "Upgrade your plan to connect more social accounts.",
    currentPlan: e.subscription.plan,
    requiredPlan: e.subscription.plan === "FREE" ? "STARTER" : "PRO",
    reason: "social_accounts_limit",
  };
}

export function canScheduleForDays(
  e: Entitlements,
  days: number
): Allowed | UpgradeRequired {
  const cfg = getPlanConfig(e.subscription.plan);
  if (days <= cfg.limits.scheduleDays) return { ok: true };
  return {
    ok: false,
    code: "UPGRADE_REQUIRED",
    message: `Upgrade your plan to schedule beyond ${cfg.limits.scheduleDays} days.`,
    currentPlan: e.subscription.plan,
    requiredPlan: e.subscription.plan === "FREE" ? "STARTER" : "PRO",
    reason: "schedule_window",
  };
}

