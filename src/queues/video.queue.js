import BullMQ from "bullmq";

import { getRedisConnection } from "../config/redis.js";

const VIDEO_QUEUE_NAME = "video-processing";

const connection = getRedisConnection();

const { Queue } = BullMQ;

export const videoQueue = new Queue(VIDEO_QUEUE_NAME, {
  connection,
});

export const addVideoProcessingJob = async (videoId) => {
  if (!videoId) {
    throw new Error("videoId is required to enqueue processing job");
  }

  await videoQueue.waitUntilReady();

  return videoQueue.add(
    "process-video",
    { videoId },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 30_000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
};

export default {
  videoQueue,
  addVideoProcessingJob,
};
