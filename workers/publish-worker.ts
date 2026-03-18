import type { Job } from "bullmq";
import { Prisma, PublishResultType } from "@prisma/client";
import { createPublishWorker, type PublishJobData } from "@/lib/queue";
import { prisma } from "@/lib/db";
import { publish } from "@/server/services/publish";

function toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function processPublishJob(job: Job<PublishJobData>) {
  const { postId, workspaceId, socialAccountId } = job.data;

  const post = await prisma.post.findFirst({
    where: { id: postId, workspaceId },
    include: { media: { include: { media: true } } },
  });

  const account = await prisma.socialAccount.findFirst({
    where: { id: socialAccountId, workspaceId },
  });

  if (!post || !account) {
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: "FAILED",
        errorMessage: "Post or account not found",
        publishResult: { error: "not_found" },
      },
    });

    await prisma.publishLog.create({
      data: {
        postId,
        resultType: PublishResultType.FAILURE,
        message: "Post or account not found",
      },
    });

    return;
  }

  if (post.status === "PUBLISHED") {
    return;
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status: "PUBLISHING" },
  });

  try {
    const result = await publish({ post, account });

    if (result.success) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          errorMessage: null,
          publishResult: toJsonValue(
            result.response ?? { success: true, externalId: result.externalId }
          ),
        },
      });

      await prisma.publishLog.create({
        data: {
          postId,
          resultType: PublishResultType.SUCCESS,
          message: result.message ?? undefined,
          response: toJsonValue(result.response),
        },
      });
    } else {
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: "FAILED",
          errorMessage: result.message ?? "Unknown error",
          publishResult: toJsonValue(result.response),
          retryCount: { increment: 1 },
        },
      });

      await prisma.publishLog.create({
        data: {
          postId,
          resultType: PublishResultType.FAILURE,
          message: result.message,
          response: toJsonValue(result.response),
        },
      });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Publish error";

    await prisma.post.update({
      where: { id: postId },
      data: {
        status: "FAILED",
        errorMessage: message,
        publishResult: { error: String(e) },
        retryCount: { increment: 1 },
      },
    });

    await prisma.publishLog.create({
      data: {
        postId,
        resultType: PublishResultType.FAILURE,
        message,
      },
    });

    throw e;
  }
}

const worker = createPublishWorker(processPublishJob);

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err);
});

console.log("[worker] Publish worker started");
