import type {
  Platform,
  PostStatus,
  MediaType,
  ConnectionStatus,
  ApprovalMode,
  ActivityAction,
} from "@prisma/client";

export type {
  Platform,
  PostStatus,
  MediaType,
  ConnectionStatus,
  ApprovalMode,
  ActivityAction,
};

export interface AiCaptionOutput {
  title?: string;
  mainCaption: string;
  shortCaption?: string;
  cta?: string;
  hashtags?: string[];
  platformNotes?: string;
  confidenceNotes?: string;
}

export interface SchedulePlanInput {
  workspaceId: string;
  durationDays: number;
  frequency: "daily" | "weekdays" | "custom";
  customDays?: number[];
  times: string[];
  approvalMode: ApprovalMode;
  mediaIds: string[];
}
