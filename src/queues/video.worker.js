import BullMQ from "bullmq";
import ffmpeg from "fluent-ffmpeg";

import { env } from "../config/env.js";
import { getRedisConnection } from "../config/redis.js";
import { processVideo, markVideoAsFailed } from "../services/video.service.js";

const VIDEO_QUEUE_NAME = "video-processing";

const { Worker } = BullMQ;

if (env.ffmpegPath) {
  ffmpeg.setFfmpegPath(env.ffmpegPath);
}

if (env.ffprobePath) {
  ffmpeg.setFfprobePath(env.ffprobePath);
}

export const videoWorker = new Worker(
  VIDEO_QUEUE_NAME,
  async (job) => {
    const { videoId } = job.data || {};

    if (!videoId) {
      throw new Error("Job payload missing videoId");
    }

    try {
      console.log("Initiating Video Processing process");
      await processVideo(videoId, ffmpeg);
    } catch (error) {
      await markVideoAsFailed(
        videoId,
        error instanceof Error ? error.message : "Unknown processing error"
      );
      throw error;
    }
  },
  {
    connection: getRedisConnection(),
    concurrency: env.videoProcessingConcurrency || 2,
  }
);

videoWorker.on("failed", (job, err) => {
  console.error(`Video processing job ${job?.id} failed`, err);
});

videoWorker.on("completed", (job) => {
  console.log(`Video processing job ${job?.id} completed successfully`);
});

export default videoWorker;
