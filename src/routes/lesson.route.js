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
import {
  create,
  list,
  update,
  uploadVideo,
  uploadVideoThumbnail,
  getVideo,
} from "../controllers/lesson.controller.js";
import { singleVideoUpload } from "../middleware/videoUpload.middleware.js";
import { singleThumbnailUpload } from "../middleware/thumbnailUpload.middleware.js";

const router = Router();

router.get(
  "/",
  optionalAuthenticate,
  // validateRequest(listLessonSchema, "query"),
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
  // validateRequest(updateLessonSchema),
  update
);

router.post(
  "/:lessonId/video",
  authenticate,
  ensureTeacher,
  validateRequest(lessonIdParamSchema, "params"),
  singleVideoUpload,
  uploadVideo
);

router.get(
  "/:lessonId/video",
  optionalAuthenticate,
  // validateRequest(lessonIdParamSchema, "params"),
  getVideo
);

router.post(
  "/:lessonId/video/thumbnail",
  authenticate,
  ensureTeacher,
  validateRequest(lessonIdParamSchema, "params"),
  singleThumbnailUpload,
  uploadVideoThumbnail
);

export default router;
