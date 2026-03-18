import type { PublishContext, PublishResult } from "./types";

/**
 * Mock publisher for MVP. Simulates success/failure and records result.
 * Replace with real platform adapters (Instagram, Facebook, etc.) later.
 */
export async function mockPublish(context: PublishContext): Promise<PublishResult> {
  const { post, account } = context;
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));

  if (Math.random() < 0.1) {
    return {
      success: false,
      message: "Simulated failure (10% chance)",
      response: { simulated: true },
    };
  }

  return {
    success: true,
    message: "Published (mock)",
    externalId: `mock_${post.id}_${Date.now()}`,
    response: {
      simulated: true,
      platform: account.platform,
      postId: post.id,
    },
  };
}
