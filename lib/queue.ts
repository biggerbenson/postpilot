import { Queue, Worker, type Job } from "bullmq";

export const PUBLISH_QUEUE_NAME = "publish";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

const connection = {
  url: redisUrl,
  maxRetriesPerRequest: null as null,
};

export const publishQueue = new Queue(PUBLISH_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 1000 },
  },
});

export interface PublishJobData {
  postId: string;
  workspaceId: string;
  socialAccountId: string;
}

export async function addPublishJob(
  data: PublishJobData
): Promise<Job<PublishJobData>> {
  return publishQueue.add("publish", data, {
    jobId: data.postId,
  });
}

export function createPublishWorker(
  processor: (job: Job<PublishJobData>) => Promise<void>
): Worker<PublishJobData> {
  return new Worker<PublishJobData>(PUBLISH_QUEUE_NAME, processor, {
    connection,
    concurrency: 5,
  });
}
