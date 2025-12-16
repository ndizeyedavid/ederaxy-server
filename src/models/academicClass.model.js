import mongoose from "mongoose";

const { Schema } = mongoose;

const AcademicClassSchema = new Schema(
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
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    level: {
      type: Schema.Types.ObjectId,
      ref: "AcademicLevel",
      required: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    combinations: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "ClassCombination",
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

AcademicClassSchema.index({ level: 1, code: 1 }, { unique: true });
AcademicClassSchema.index({ level: 1, order: 1 });

export const AcademicClass = mongoose.model(
  "AcademicClass",
  AcademicClassSchema
);

export default AcademicClass;
