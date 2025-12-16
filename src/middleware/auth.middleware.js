import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/helpers.js";
import { verifyToken } from "../utils/jwt.js";
import User from "../models/user.model.js";

const extractTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractTokenFromRequest(req);

  if (!token) {
    throw ApiError.unauthorized("Authentication token missing");
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await User.findById(payload.userId);

  if (!user) {
    throw ApiError.unauthorized("Account not found");
  }

  req.user = user;
  req.auth = {
    token,
    payload,
  };

  next();
});

export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const token = extractTokenFromRequest(req);

  if (!token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);

    if (user) {
      req.user = user;
      req.auth = {
        token,
        payload,
      };
    }
  } catch (error) {
    // Ignore invalid token for optional auth
  }

  return next();
});

export default {
  authenticate,
  optionalAuthenticate,
};
