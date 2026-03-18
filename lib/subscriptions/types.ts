import type { PlanName, SubscriptionStatus } from "@prisma/client";

export type SubscriptionSnapshot = {
  plan: PlanName;
  status: SubscriptionStatus;
  currentPeriodStart: string; // ISO
  currentPeriodEnd: string; // ISO
  cancelAtPeriodEnd: boolean;
};

export type UsageSnapshot = {
  periodStart: string; // ISO
  periodEnd: string; // ISO
  aiGenerations: number;
  regenerations: number;
};

export type Entitlements = {
  subscription: SubscriptionSnapshot;
  usage: UsageSnapshot;
  counts: {
    socialAccountsUsed: number;
    brandProfilesUsed: number; // mapped to workspaces in current app
    teamMembersUsed: number; // placeholder
  };
};

