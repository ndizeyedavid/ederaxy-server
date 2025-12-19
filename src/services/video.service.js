import fs from "fs/promises";
import path from "path";

import ApiError from "../utils/apiError.js";
import Lesson from "../models/lesson.model.js";
import Video from "../models/video.model.js";
import { USER_ROLES, VIDEO_STATES } from "../utils/constants.js";
import {
  getUploadsDir,
  getRelativeUploadPath,
  ensureHlsFolder,
  getRelativeHlsPath,
  ensureThumbnailsFolder,
  getRelativeThumbnailPath,
  toAbsolutePath,
} from "../utils/storage.js";
import { addVideoProcessingJob } from "../queues/video.queue.js";

const isTeacher = (user) => user?.role === USER_ROLES.TEACHER;

const assertLessonOwnership = async (lessonId, user) => {
  const lesson = await Lesson.findById(lessonId).populate({
    path: "course",
    populate: { path: "teacher", select: "_id" },
  });

  if (!lesson) {
    throw ApiError.notFound("Lesson not found");
  }

  const courseTeacherId = lesson.course?.teacher?._id ?? lesson.course?.teacher;

  if (
    !isTeacher(user) ||
    courseTeacherId?.toString() !== user?._id?.toString()
  ) {
    throw ApiError.forbidden(
      "You do not have permission to modify this lesson"
    );
  }

  return lesson;
};

const cleanupUploadFolder = async (folderName) => {
  if (!folderName) return;

  const uploadsDir = getUploadsDir();
  const folderPath = path.join(uploadsDir, folderName);

  await fs.rm(folderPath, { recursive: true, force: true }).catch(() => {});
};

export const uploadLessonVideo = async ({
  lessonId,
  user,
  file,
  uploadContext,
}) => {
  if (!file) {
    throw ApiError.badRequest("Video file is required");
  }

  if (!uploadContext?.folderName || !uploadContext?.fileName) {
    throw ApiError.badRequest("Upload context is missing. Try again.");
  }

  const lesson = await assertLessonOwnership(lessonId, user);

  const storageKey = uploadContext.folderName;
  const originalPath = getRelativeUploadPath(
    storageKey,
    uploadContext.fileName
  );

  let video;

  try {
    video = await Video.create({
      lesson: lesson._id,
      uploadedBy: user._id,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storageKey,
      originalPath,
      status: VIDEO_STATES.UPLOADED,
    });

    lesson.video = video._id;
    await lesson.save();

    const job = await addVideoProcessingJob(video._id.toString());

    video.jobId = job.id?.toString() ?? null;
    video.status = VIDEO_STATES.PROCESSING;
    await video.save();

    return video;
  } catch (error) {
    await cleanupUploadFolder(storageKey);
    throw error;
  }
};

const buildVideoResponse = (video, user) => {
  if (!video) return null;

  const isOwner =
    isTeacher(user) &&
    video.lesson?.course?.teacher?.toString() === user?._id?.toString();

  if (video.status !== VIDEO_STATES.READY && !isOwner) {
    throw ApiError.notFound("Video is not available");
  }

  return {
    id: video._id,
    lesson: video.lesson?._id ?? video.lesson,
    status: video.status,
    hlsMasterPlaylistPath: video.hlsMasterPlaylistPath,
    thumbnailUrl: video.thumbnailUrl,
    thumbnailPath: video.thumbnailPath,
    thumbnailMimeType: video.thumbnailMimeType,
    thumbnailSize: video.thumbnailSize,
    variants: video.variants,
    duration: video.duration,
    failureReason: isOwner ? video.failureReason : undefined,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  };
};

export const uploadLessonVideoThumbnail = async ({ lessonId, user, file }) => {
  if (!file) {
    throw ApiError.badRequest("Thumbnail file is required");
  }

  await assertLessonOwnership(lessonId, user);

  const video = await Video.findOne({ lesson: lessonId }).sort({
    createdAt: -1,
  });

  if (!video) {
    throw ApiError.notFound("Video not found");
  }

  if (!video.storageKey) {
    throw ApiError.badRequest("Video storage key is missing");
  }

  const extensionFromMime = (mimeType) => {
    if (mimeType === "image/jpeg") return ".jpg";
    if (mimeType === "image/png") return ".png";
    if (mimeType === "image/webp") return ".webp";
    if (mimeType === "image/gif") return ".gif";
    return "";
  };

  const fileExtension =
    extensionFromMime(file.mimetype) ||
    path.extname(file.originalname || "").toLowerCase() ||
    ".jpg";
  const fileName = `thumbnail${fileExtension}`;

  const thumbnailsDir = await ensureThumbnailsFolder(video.storageKey);
  const absoluteThumbnailPath = path.join(thumbnailsDir, fileName);

  if (video.thumbnailPath) {
    const existingAbsolute = toAbsolutePath(video.thumbnailPath);
    await fs.rm(existingAbsolute, { force: true }).catch(() => {});
  }

  await fs.writeFile(absoluteThumbnailPath, file.buffer);

  const relativePath = getRelativeThumbnailPath(video.storageKey, fileName);
  const publicUrl = `/${path.posix.join("storage", relativePath)}`;

  video.thumbnailPath = relativePath;
  video.thumbnailUrl = publicUrl;
  video.thumbnailMimeType = file.mimetype;
  video.thumbnailSize = file.size;
  await video.save();

  return buildVideoResponse(video.toObject ? video.toObject() : video, user);
};

export const getVideoById = async (videoId, user) => {
  const video = await Video.findById(videoId)
    .populate({
      path: "lesson",
      select: "course",
      populate: { path: "course", select: "teacher" },
    })
    .lean({ virtuals: true });

  if (!video) {
    throw ApiError.notFound("Video not found");
  }

  return buildVideoResponse(video, user);
};

export const getLessonVideo = async (lessonId, user) => {
  const video = await Video.findOne({ lesson: lessonId })
    .sort({ createdAt: -1 })
    .populate({
      path: "lesson",
      select: "course",
      populate: { path: "course", select: "teacher" },
    })
    .lean({ virtuals: true });

  if (!video) {
    throw ApiError.notFound("Video not found");
  }

  return buildVideoResponse(video, user);
};

export const variantProfiles = [
  {
    resolution: "240p",
    height: 240,
    videoBitrate: "400k",
    audioBitrate: "64k",
    bandwidth: 550000,
    resolutionLabel: "426x240",
  },
  {
    resolution: "480p",
    height: 480,
    videoBitrate: "800k",
    audioBitrate: "96k",
    bandwidth: 1200000,
    resolutionLabel: "854x480",
  },
  {
    resolution: "720p",
    height: 720,
    videoBitrate: "2000k",
    audioBitrate: "128k",
    bandwidth: 2800000,
    resolutionLabel: "1280x720",
  },
];

export const markVideoAsFailed = async (videoId, reason) => {
  await Video.findByIdAndUpdate(videoId, {
    status: VIDEO_STATES.FAILED,
    failureReason: reason,
    processingCompletedAt: new Date(),
  });
};

export const markVideoAsProcessing = async (videoId) => {
  await Video.findByIdAndUpdate(videoId, {
    status: VIDEO_STATES.PROCESSING,
    processingStartedAt: new Date(),
    failureReason: null,
  });
};

export const finalizeVideoProcessing = async (
  videoId,
  { variants, masterPlaylistPath, duration }
) => {
  await Video.findByIdAndUpdate(videoId, {
    status: VIDEO_STATES.READY,
    hlsDirectory: getRelativeHlsPath(variants?.[0]?.storageKey ?? ""),
    hlsMasterPlaylistPath: masterPlaylistPath,
    variants: variants.map(({ resolution, bandwidth, playlistPath }) => ({
      resolution,
      bandwidth,
      playlistPath,
    })),
    duration: duration ?? null,
    processingCompletedAt: new Date(),
  });
};

export const processVideo = async (videoId, ffmpegInstance) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new Error("Video not found");
  }

  await markVideoAsProcessing(videoId);

  const inputPath = toAbsolutePath(video.originalPath);
  const storageKey = video.storageKey;

  if (!storageKey) {
    throw new Error("Video storage key is missing");
  }

  const hlsRelativeDir = getRelativeHlsPath(storageKey);
  const hlsAbsoluteDir = toAbsolutePath(hlsRelativeDir);

  await fs.rm(hlsAbsoluteDir, { recursive: true, force: true });
  const hlsDir = await ensureHlsFolder(storageKey);

  const generateVariant = (profile) =>
    new Promise((resolve, reject) => {
      const playlistFilename = `${profile.resolution}.m3u8`;
      const segmentPattern = path.join(hlsDir, `${profile.resolution}_%03d.ts`);
      const outputPath = path.join(hlsDir, playlistFilename);

      ffmpegInstance(inputPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions([
          "-preset veryfast",
          "-movflags +faststart",
          "-profile:v main",
          "-g 48",
          "-keyint_min 48",
          `-vf scale=-2:${profile.height}`,
          `-b:v ${profile.videoBitrate}`,
          `-maxrate ${profile.videoBitrate}`,
          `-bufsize ${profile.videoBitrate}`,
          `-b:a ${profile.audioBitrate}`,
          "-ac 2",
          "-ar 48000",
          "-hls_time 6",
          "-hls_playlist_type vod",
          "-hls_flags independent_segments",
          `-hls_segment_filename ${segmentPattern}`,
        ])
        .on("end", () => {
          resolve({
            resolution: profile.resolution,
            bandwidth: profile.bandwidth,
            playlistPath: getRelativeHlsPath(storageKey, playlistFilename),
            storageKey,
            resolutionLabel: profile.resolutionLabel,
          });
        })
        .on("error", reject)
        .save(outputPath);
    });

  const variants = [];

  for (const profile of variantProfiles) {
    const variant = await generateVariant(profile);
    variants.push(variant);
  }

  const masterPlaylistPath = path.join(hlsDir, "master.m3u8");
  const masterContent = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    ...variants.flatMap((variant) => [
      `#EXT-X-STREAM-INF:BANDWIDTH=${variant.bandwidth},RESOLUTION=${variant.resolutionLabel}`,
      path.posix.basename(variant.playlistPath),
    ]),
  ].join("\n");

  await fs.writeFile(masterPlaylistPath, `${masterContent}\n`, "utf8");

  const metadata = await new Promise((resolve, reject) => {
    ffmpegInstance.ffprobe(inputPath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(data);
    });
  });

  const duration = metadata?.format?.duration
    ? Math.round(metadata.format.duration)
    : null;

  const relativeMasterPath = getRelativeHlsPath(storageKey, "master.m3u8");
  const toPublicPath = (relativePath) =>
    `/${path.posix.join("storage", relativePath.replace(/^\/+/, ""))}`;

  const persistedVariants = variants.map(
    ({
      resolution,
      bandwidth,
      playlistPath,
      storageKey: variantStorageKey,
      resolutionLabel,
    }) => ({
      resolution,
      bandwidth,
      playlistPath,
      publicPlaylistPath: toPublicPath(playlistPath),
      storageKey: variantStorageKey,
      resolutionLabel,
    })
  );

  await Video.findByIdAndUpdate(videoId, {
    status: VIDEO_STATES.READY,
    hlsDirectory: getRelativeHlsPath(storageKey),
    hlsMasterPlaylistPath: toPublicPath(relativeMasterPath),
    variants: persistedVariants,
    duration,
    processingCompletedAt: new Date(),
  });

  return {
    masterPlaylistPath: toPublicPath(relativeMasterPath),
    variants: persistedVariants,
    duration,
  };
};

export default {
  uploadLessonVideo,
  uploadLessonVideoThumbnail,
  getVideoById,
  getLessonVideo,
  processVideo,
};
