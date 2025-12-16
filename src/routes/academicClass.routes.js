import { Router } from "express";

import validateRequest from "../middleware/validate.middleware.js";
import {
  authenticate,
  optionalAuthenticate,
} from "../middleware/auth.middleware.js";
import { ensureTeacher } from "../middleware/role.middleware.js";
import {
  createAcademicClassSchema,
  updateAcademicClassSchema,
  academicClassIdParamSchema,
  listAcademicClassesQuerySchema,
  academicClassDetailQuerySchema,
} from "../validations/academicClass.validation.js";
import {
  create,
  list,
  detail,
  update,
} from "../controllers/academicClass.controller.js";

const router = Router();

router.get(
  "/",
  optionalAuthenticate,
  validateRequest(listAcademicClassesQuerySchema, "query"),
  list
);

router.post(
  "/",
  authenticate,
  ensureTeacher,
  validateRequest(createAcademicClassSchema),
  create
);

router.get(
  "/:classId",
  optionalAuthenticate,
  validateRequest(academicClassIdParamSchema, "params"),
  validateRequest(academicClassDetailQuerySchema, "query"),
  detail
);

router.patch(
  "/:classId",
  authenticate,
  ensureTeacher,
  validateRequest(academicClassIdParamSchema, "params"),
  validateRequest(updateAcademicClassSchema),
  update
);

export default router;
