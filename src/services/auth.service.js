import ApiError from "../utils/apiError.js";
import { signToken, signRefreshToken } from "../utils/jwt.js";
import { USER_ROLES } from "../utils/constants.js";
import { pick } from "../utils/helpers.js";
import User from "../models/user.model.js";

const publicUserFields = [
  "_id",
  "fullName",
  "email",
  "role",
  "dob",
  "nationalId",
  "profilePicture",
  "bio",
  "createdAt",
  "updatedAt",
];

export const toPublicUser = (userDoc) => {
  if (!userDoc) return null;
  const userObject = userDoc.toJSON ? userDoc.toJSON() : userDoc;
  return pick(userObject, publicUserFields);
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
  toPublicUser,
};
