import type { PlanName } from "@prisma/client";

export type CaptionLength = "short" | "long";

export type PlanConfig = {
  name: PlanName;
  label: string;
  priceUsdMonthly: number;
  interval: "month";
  // hard/soft limits
  limits: {
    aiPostsPerPeriod: number; // soft caps use very large number
    socialAccounts: number;
    brandProfiles: number; // mapped to workspaces in this app
    teamMembers: number;
    scheduleDays: number; // use large number for "unlimited"
    storageMb: number; // placeholder
  };
  features: {
    canRegenerate: boolean;
    canUseLongCaptions: boolean;
    hasAnalytics: "none" | "basic" | "standard" | "advanced";
    hasHashtagGeneration: boolean;
    hasContentSuggestions: boolean;
    hasBulkUpload: boolean;
    hasPriorityAi: boolean;
    hasWatermarkRemoval: boolean;
    hasApiAccess: boolean; // placeholder for future
    hasWhiteLabel: boolean; // placeholder for future
  };
};

// Soft caps for "unlimited" plans to prevent abuse
export const AGENCY_SOFT_CAPS = {
  aiPostsPerPeriod: 10_000,
  socialAccounts: 500,
  brandProfiles: 500,
  teamMembers: 100,
} as const;

export const PLANS: Record<PlanName, PlanConfig> = {
  FREE: {
    name: "FREE",
    label: "Free",
    priceUsdMonthly: 0,
    interval: "month",
    limits: {
      aiPostsPerPeriod: 2, // total allowed (we treat it as per-period, but Free is effectively same in MVP)
      socialAccounts: 1,
      brandProfiles: 1,
      teamMembers: 1,
      scheduleDays: 3,
      storageMb: 200,
    },
    features: {
      canRegenerate: false,
      canUseLongCaptions: false,
      hasAnalytics: "none",
      hasHashtagGeneration: false,
      hasContentSuggestions: false,
      hasBulkUpload: false,
      hasPriorityAi: false,
      hasWatermarkRemoval: false,
      hasApiAccess: false,
      hasWhiteLabel: false,
    },
  },
  STARTER: {
    name: "STARTER",
    label: "Starter",
    priceUsdMonthly: 5,
    interval: "month",
    limits: {
      aiPostsPerPeriod: 60,
      socialAccounts: 3,
      brandProfiles: 1,
      teamMembers: 1,
      scheduleDays: 7,
      storageMb: 1_000,
    },
    features: {
      canRegenerate: false,
      canUseLongCaptions: false,
      hasAnalytics: "basic",
      hasHashtagGeneration: false,
      hasContentSuggestions: false,
      hasBulkUpload: false,
      hasPriorityAi: false,
      hasWatermarkRemoval: false,
      hasApiAccess: false,
      hasWhiteLabel: false,
    },
  },
  PRO: {
    name: "PRO",
    label: "Pro",
    priceUsdMonthly: 12,
    interval: "month",
    limits: {
      aiPostsPerPeriod: 300,
      socialAccounts: 10,
      brandProfiles: 3,
      teamMembers: 2,
      scheduleDays: 30,
      storageMb: 5_000,
    },
    features: {
      canRegenerate: true,
      canUseLongCaptions: true,
      hasAnalytics: "standard",
      hasHashtagGeneration: true,
      hasContentSuggestions: true,
      hasBulkUpload: false,
      hasPriorityAi: false,
      hasWatermarkRemoval: false,
      hasApiAccess: false,
      hasWhiteLabel: false,
    },
  },
  BUSINESS: {
    name: "BUSINESS",
    label: "Business",
    priceUsdMonthly: 25,
    interval: "month",
    limits: {
      aiPostsPerPeriod: 1000,
      socialAccounts: 25,
      brandProfiles: 10,
      teamMembers: 5,
      scheduleDays: 3650, // "unlimited" scheduling window in practice
      storageMb: 20_000,
    },
    features: {
      canRegenerate: true,
      canUseLongCaptions: true,
      hasAnalytics: "advanced",
      hasHashtagGeneration: true,
      hasContentSuggestions: true,
      hasBulkUpload: true,
      hasPriorityAi: true,
      hasWatermarkRemoval: true,
      hasApiAccess: false,
      hasWhiteLabel: false,
    },
  },
  AGENCY: {
    name: "AGENCY",
    label: "Agency",
    priceUsdMonthly: 49,
    interval: "month",
    limits: {
      aiPostsPerPeriod: AGENCY_SOFT_CAPS.aiPostsPerPeriod,
      socialAccounts: AGENCY_SOFT_CAPS.socialAccounts,
      brandProfiles: AGENCY_SOFT_CAPS.brandProfiles,
      teamMembers: AGENCY_SOFT_CAPS.teamMembers,
      scheduleDays: 3650,
      storageMb: 100_000,
    },
    features: {
      canRegenerate: true,
      canUseLongCaptions: true,
      hasAnalytics: "advanced",
      hasHashtagGeneration: true,
      hasContentSuggestions: true,
      hasBulkUpload: true,
      hasPriorityAi: true,
      hasWatermarkRemoval: true,
      hasApiAccess: true,
      hasWhiteLabel: true,
    },
  },
};

export const PLAN_ORDER: PlanName[] = [
  "FREE",
  "STARTER",
  "PRO",
  "BUSINESS",
  "AGENCY",
];

export function getPlanConfig(plan: PlanName) {
  return PLANS[plan] ?? PLANS.FREE;
}

