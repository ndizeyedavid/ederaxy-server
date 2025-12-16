import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import env from "../config/env.js";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    dob: {
      type: Date,
    },
    nationalId: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: /^([a-zA-Z0-9_\-.+])+@([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

UserSchema.pre("validate", function validateNationalId(next) {
  if (this.role === "teacher" && !this.nationalId) {
    this.invalidate("nationalId", "Teachers must provide a national ID");
  }
});

UserSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(env.bcryptSaltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    // console.log(error)
  }
});

UserSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.canCreateContent = function canCreateContent() {
  return this.role === "teacher";
};

UserSchema.methods.isTeacher = function isTeacher() {
  return this.role === "teacher";
};

UserSchema.methods.isStudent = function isStudent() {
  return this.role === "student";
};

export const User = mongoose.model("User", UserSchema);

export default User;
