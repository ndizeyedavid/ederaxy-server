import mongoose from "mongoose";

const { Schema } = mongoose;

const SubjectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    curriculum: {
      type: Schema.Types.ObjectId,
      ref: "Curriculum",
      required: true,
      index: true,
    },
    targetLevels: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "AcademicLevel",
        },
      ],
      default: [],
    },
    targetClasses: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "AcademicClass",
        },
      ],
      default: [],
    },
    targetCombinations: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "ClassCombination",
        },
      ],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

SubjectSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "subject",
  justOne: false,
});

SubjectSchema.index(
  { curriculum: 1, title: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export const Subject = mongoose.model("Subject", SubjectSchema);

export default Subject;
