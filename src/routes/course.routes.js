import { Router } from "express";

import validateRequest from "../middleware/validate.middleware.js";
import {
  authenticate,
  optionalAuthenticate,
} from "../middleware/auth.middleware.js";
import { ensureTeacher } from "../middleware/role.middleware.js";
import {
  createCourseSchema,
  updateCourseSchema,
  listCourseSchema,
  courseIdParamSchema,
} from "../validations/course.validation.js";
import {
  create,
  list,
  detail,
  update,
} from "../controllers/course.controller.js";

const router = Router();

router.get(
  "/",
  optionalAuthenticate,
  // validateRequest(listCourseSchema, "query"),
  list
);

router.post(
  "/",
  authenticate,
  ensureTeacher,
  // validateRequest(createCourseSchema),
  create
);

router.get(
  "/:courseId",
  optionalAuthenticate,
  validateRequest(courseIdParamSchema, "params"),
  detail
);

router.patch(
  "/:courseId",
  authenticate,
  ensureTeacher,
  validateRequest(courseIdParamSchema, "params"),
  validateRequest(updateCourseSchema),
  update
);

export default router;
