import ApiError from "../utils/apiError.js";
import { signToken, signRefreshToken } from "../utils/jwt.js";
import { USER_ROLES } from "../utils/constants.js";
import { pick } from "../utils/helpers.js";
import User from "../models/user.model.js";
import fs from "fs/promises";
import path from "path";
import {
  ensureProfilePicturesFolder,
  getRelativeProfilePicturePath,
  toAbsolutePath,
} from "../utils/storage.js";

const publicUserFields = [
  "_id",
  "fullName",
  "email",
  "role",
  "dob",
  "nationalId",
  "profilePicture",
  "bio",
  "phone",
  "teacherTitle",
  "yearsExperience",
  "highestQualification",
  "subjects",
  "schoolName",
  "schoolType",
  "country",
  "city",
  "preferredCurriculumId",
  "agreedToTermsAt",
  "termsVersion",
  "createdAt",
  "updatedAt",
];

export const toPublicUser = (userDoc) => {
  if (!userDoc) return null;
  const userObject = userDoc.toJSON ? userDoc.toJSON() : userDoc;
  return pick(userObject, publicUserFields);
};

export const uploadProfilePicture = async ({ user, file }) => {
  if (!user?._id) {
    throw ApiError.unauthorized("Authentication required");
  }

  if (!file) {
    throw ApiError.badRequest("Profile picture file is required");
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
  const fileName = `profile${fileExtension}`;
  const folderName = user._id.toString();

  const profileDir = await ensureProfilePicturesFolder(folderName);
  const absolutePath = path.join(profileDir, fileName);

  const userDoc = await User.findById(user._id);
  if (!userDoc) {
    throw ApiError.notFound("User not found");
  }

  if (userDoc.profilePicture) {
    const normalized = userDoc.profilePicture.replace(/^\/storage\//, "");
    const existingAbsolute = toAbsolutePath(normalized);
    await fs.rm(existingAbsolute, { force: true }).catch(() => {});
  }

  await fs.writeFile(absolutePath, file.buffer);

  const relativePath = getRelativeProfilePicturePath(folderName, fileName);
  userDoc.profilePicture = `/${path.posix.join("storage", relativePath)}`;
  await userDoc.save();

  return toPublicUser(userDoc);
};

const buildTokenPayload = (user) => ({
  userId: user._id.toString(),
  role: user.role,
});

export const registerUser = async (payload) => {
  const { email, role = USER_ROLES.STUDENT } = payload;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict("Email is already registered");
  }

  const userData = {
    ...payload,
    email,
    role,
  };

  if (userData.agreeToTerms) {
    userData.agreedToTermsAt = new Date();
  }

  delete userData.agreeToTerms;

  if (userData.dob) {
    userData.dob = new Date(userData.dob);
  }

  const user = await User.create(userData);

  const tokenPayload = buildTokenPayload(user);
  const accessToken = signToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  return {
    user: toPublicUser(user),
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const tokenPayload = buildTokenPayload(user);
  const accessToken = signToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  return {
    user: toPublicUser(user),
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

export default {
  registerUser,
  loginUser,
  uploadProfilePicture,
  toPublicUser,
};
