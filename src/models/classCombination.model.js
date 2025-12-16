import mongoose from "mongoose";

import { CLASS_COMBINATION_TYPES } from "../utils/constants.js";

const { Schema } = mongoose;

const ClassCombinationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: Object.values(CLASS_COMBINATION_TYPES),
      default: CLASS_COMBINATION_TYPES.GENERAL,
      index: true,
    },
    subjects: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Subject",
        },
      ],
      default: [],
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

ClassCombinationSchema.index({ code: 1 }, { unique: true });
ClassCombinationSchema.index(
  { name: 1 },
  { collation: { locale: "en", strength: 2 } }
);

export const ClassCombination = mongoose.model(
  "ClassCombination",
  ClassCombinationSchema
);

export default ClassCombination;
