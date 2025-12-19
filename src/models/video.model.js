import mongoose from "mongoose";

import { VIDEO_STATES } from "../utils/constants.js";

const { Schema } = mongoose;

const VideoVariantSchema = new Schema(
  {
    resolution: {
      type: String,
      required: true,
      trim: true,
    },
    bandwidth: {
      type: Number,
      required: true,
    },
    playlistPath: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const VideoSchema = new Schema(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
      trim: true,
    },
    originalPath: {
      type: String,
      required: true,
      trim: true,
    },
    hlsDirectory: {
      type: String,
      trim: true,
      default: null,
    },
    hlsMasterPlaylistPath: {
      type: String,
      trim: true,
      default: null,
    },
    thumbnailPath: {
      type: String,
      trim: true,
      default: null,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: null,
    },
    thumbnailMimeType: {
      type: String,
      trim: true,
      default: null,
    },
    thumbnailSize: {
      type: Number,
      default: null,
    },
    variants: {
      type: [VideoVariantSchema],
      default: [],
    },
    duration: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(VIDEO_STATES),
      default: VIDEO_STATES.UPLOADED,
      index: true,
    },
    failureReason: {
      type: String,
      trim: true,
      default: null,
    },
    jobId: {
      type: String,
      trim: true,
      default: null,
    },
    processingStartedAt: {
      type: Date,
      default: null,
    },
    processingCompletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

VideoSchema.index({ lesson: 1, status: 1 });

const Video = mongoose.model("Video", VideoSchema);

export default Video;
