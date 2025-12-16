import { Router } from "express";

import validateRequest from "../middleware/validate.middleware.js";
import { authRateLimiter, createAuthRateLimiter } from "../config/rateLimit.js";
import env from "../config/env.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { login, register, me } from "../controllers/auth.controller.js";

const router = Router();

router.post(
  "/register",
  createAuthRateLimiter({
    max: Math.min(20, env.authRateLimitMax),
  }),
  validateRequest(registerSchema),
  register
);

router.post("/login", authRateLimiter, validateRequest(loginSchema), login);

router.get("/me", authenticate, me);

export default router;
