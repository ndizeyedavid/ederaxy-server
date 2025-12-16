import mongoose from "mongoose";

const { Schema } = mongoose;

const LessonSchema = new Schema(
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
      maxlength: 4000,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    resources: {
      type: [
        {
          label: { type: String, trim: true },
          url: { type: String, trim: true },
        },
      ],
      default: [],
    },
    // Placeholder for future video linkage
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
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

LessonSchema.index({ course: 1, order: 1 }, { unique: true });
LessonSchema.index(
  { course: 1, title: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export const Lesson = mongoose.model("Lesson", LessonSchema);

export default Lesson;
