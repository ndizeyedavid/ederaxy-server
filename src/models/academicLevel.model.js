import mongoose from "mongoose";

import { EDUCATION_STAGES } from "../utils/constants.js";

const { Schema } = mongoose;

const AcademicLevelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    stage: {
      type: String,
      // enum: Object.values(EDUCATION_STAGES),
      required: true,
      index: true,
    },
    curriculum: {
      type: Schema.Types.ObjectId,
      ref: "Curriculum",
      required: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
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

AcademicLevelSchema.index({ curriculum: 1, stage: 1, order: 1 });
AcademicLevelSchema.index({ curriculum: 1, slug: 1 }, { unique: true });

export const AcademicLevel = mongoose.model(
  "AcademicLevel",
  AcademicLevelSchema
);

export default AcademicLevel;
