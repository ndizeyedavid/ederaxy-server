import { rateLimit } from "express-rate-limit";

import env from "./env.js";

export const createAuthRateLimiter = ({
  windowMs = env.authRateLimitWindowMs,
  max = env.authRateLimitMax,
  message = "Too many authentication attempts. Please try again later.",
} = {}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: "error",
      message,
    },
  });

export const authRateLimiter = createAuthRateLimiter();

export default authRateLimiter;
