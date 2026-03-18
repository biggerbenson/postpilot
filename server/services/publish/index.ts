import type { Platform } from "@prisma/client";
import { mockPublish } from "./mock-publisher";
import type { PublishContext, PublishResult } from "./types";

const publishers: Partial<Record<Platform, (ctx: PublishContext) => Promise<PublishResult>>> = {
  INSTAGRAM: mockPublish,
  FACEBOOK: mockPublish,
  LINKEDIN: mockPublish,
  X: mockPublish,
  TIKTOK: mockPublish,
};

export async function publish(context: PublishContext): Promise<PublishResult> {
  const fn = publishers[context.account.platform];
  if (!fn) {
    return {
      success: false,
      message: `No publisher for platform: ${context.account.platform}`,
    };
  }
  return fn(context);
}

export { mockPublish };
export type { PublishContext, PublishResult, IPublisher } from "./types";
