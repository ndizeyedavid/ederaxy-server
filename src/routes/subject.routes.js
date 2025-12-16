import { Router } from "express";

import validateRequest from "../middleware/validate.middleware.js";
import {
  authenticate,
  optionalAuthenticate,
} from "../middleware/auth.middleware.js";
import { ensureTeacher } from "../middleware/role.middleware.js";
import {
  createSubjectSchema,
  updateSubjectSchema,
  subjectIdParamSchema,
  listSubjectsQuerySchema,
} from "../validations/subject.validation.js";
import {
  create,
  list,
  detail,
  update,
} from "../controllers/subject.controller.js";

const router = Router();

router.get(
  "/all/:curriculumId",
  // optionalAuthenticate,
  // validateRequest(listSubjectsQuerySchema, "query"),
  list
);

router.post(
  "/",
  authenticate,
  ensureTeacher,
  validateRequest(createSubjectSchema),
  create
);

router.get(
  "/:subjectId",
  optionalAuthenticate,
  validateRequest(subjectIdParamSchema, "params"),
  detail
);

router.patch(
  "/:subjectId",
  authenticate,
  ensureTeacher,
  validateRequest(subjectIdParamSchema, "params"),
  validateRequest(updateSubjectSchema),
  update
);

export default router;
