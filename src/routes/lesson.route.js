import { Router } from "express";

import validateRequest from "../middleware/validate.middleware.js";
import {
  authenticate,
  optionalAuthenticate,
} from "../middleware/auth.middleware.js";
import { ensureTeacher } from "../middleware/role.middleware.js";
import {
  createLessonSchema,
  updateLessonSchema,
  lessonIdParamSchema,
  listLessonSchema,
} from "../validations/lesson.validation.js";
import { create, list, update } from "../controllers/lesson.controller.js";

const router = Router();

router.get(
  "/",
  optionalAuthenticate,
  validateRequest(listLessonSchema, "query"),
  list
);

router.post(
  "/",
  authenticate,
  ensureTeacher,
  validateRequest(createLessonSchema),
  create
);

router.patch(
  "/:lessonId",
  authenticate,
  ensureTeacher,
  validateRequest(lessonIdParamSchema, "params"),
  validateRequest(updateLessonSchema),
  update
);

export default router;
