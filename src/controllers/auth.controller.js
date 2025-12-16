import ApiError from "../utils/apiError.js";
import { createdResponse, successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/helpers.js";
import {
  loginUser,
  registerUser,
  toPublicUser,
} from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  return createdResponse(res, result, "User registered successfully");
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  return successResponse(res, result, "Login successful");
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  return successResponse(res, { user: toPublicUser(req.user) });
});

export const requireAuth = (_req, _res, next) =>
  next(ApiError.unauthorized("Authentication required"));

export default {
  register,
  login,
  me,
};
