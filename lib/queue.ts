import { Queue, Worker, type Job } from "bullmq";

export const PUBLISH_QUEUE_NAME = "publish";

const redisUrl = process.env.REDIS_URL;

const connection = redisUrl
  ? {
      url: redisUrl,
      maxRetriesPerRequest: null as null,
    }
  : null;

let queueInstance: Queue<PublishJobData> | null = null;

function getPublishQueue() {
  if (!connection) {
    throw new Error("REDIS_URL is not set");
  }

  if (!queueInstance) {
    queueInstance = new Queue<PublishJobData>(PUBLISH_QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 1000 },
      },
    });
  }

  return queueInstance;
}

export interface PublishJobData {
  postId: string;
  workspaceId: string;
  socialAccountId: string;
}

export async function addPublishJob(
  data: PublishJobData
): Promise<Job<PublishJobData>> {
  return getPublishQueue().add("publish", data, {
    jobId: data.postId,
  });
}

export function createPublishWorker(
  processor: (job: Job<PublishJobData>) => Promise<void>
): Worker<PublishJobData> {
  if (!connection) {
    throw new Error("REDIS_URL is not set");
  }

  return new Worker<PublishJobData>(PUBLISH_QUEUE_NAME, processor, {
    connection,
    concurrency: 5,
  });
}
