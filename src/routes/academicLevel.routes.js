import { Router } from "express";

import validateRequest from "../middleware/validate.middleware.js";
import {
  authenticate,
  optionalAuthenticate,
} from "../middleware/auth.middleware.js";
import { ensureTeacher } from "../middleware/role.middleware.js";
import {
  createAcademicLevelSchema,
  updateAcademicLevelSchema,
  academicLevelIdParamSchema,
  listAcademicLevelsQuerySchema,
  academicLevelDetailQuerySchema,
} from "../validations/academicLevel.validation.js";
import {
  create,
  list,
  detail,
  update,
} from "../controllers/academicLevel.controller.js";

const router = Router();

router.get(
  "/",
  optionalAuthenticate,
  // validateRequest(listAcademicLevelsQuerySchema, "query"),
  list
);

router.post(
  "/",
  authenticate,
  ensureTeacher,
  validateRequest(createAcademicLevelSchema),
  create
);

router.get(
  "/:levelId",
  optionalAuthenticate,
  validateRequest(academicLevelIdParamSchema, "params"),
  // validateRequest(academicLevelDetailQuerySchema, "query"),
  detail
);

router.patch(
  "/:levelId",
  authenticate,
  ensureTeacher,
  validateRequest(academicLevelIdParamSchema, "params"),
  validateRequest(updateAcademicLevelSchema),
  update
);

export default router;
