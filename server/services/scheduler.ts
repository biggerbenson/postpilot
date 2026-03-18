import { prisma } from "@/lib/db";
import { addPublishJob } from "@/lib/queue";

const BATCH_SIZE = 50;

/**
 * Finds posts that are SCHEDULED and due, and enqueues them for publishing.
 * Call this from a cron or the worker loop.
 */
export async function enqueueDuePosts(): Promise<number> {
  const now = new Date();
  const due = await prisma.post.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
    take: BATCH_SIZE,
    select: { id: true, workspaceId: true, socialAccountId: true },
  });

  let enqueued = 0;
  for (const post of due) {
    try {
      await addPublishJob({
        postId: post.id,
        workspaceId: post.workspaceId,
        socialAccountId: post.socialAccountId,
      });
      enqueued++;
    } catch (e) {
      console.error("[scheduler] Failed to enqueue post", post.id, e);
    }
  }

  return enqueued;
}
