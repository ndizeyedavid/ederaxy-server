import mongoose from "mongoose";

const { Schema } = mongoose;

const CurriculumSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    country: {
      type: String,
      trim: true,
      default: "Rwanda",
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
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

CurriculumSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);
CurriculumSchema.index({ slug: 1 }, { unique: true });

export const Curriculum = mongoose.model("Curriculum", CurriculumSchema);

export default Curriculum;
