import { Router } from "express";

import validateRequest from "../middleware/validate.middleware.js";
import {
  authenticate,
  optionalAuthenticate,
} from "../middleware/auth.middleware.js";
import { ensureTeacher } from "../middleware/role.middleware.js";
import {
  createCurriculumSchema,
  updateCurriculumSchema,
  curriculumIdParamSchema,
  listCurriculumsQuerySchema,
  curriculumDetailQuerySchema,
} from "../validations/curriculum.validation.js";
import {
  create,
  list,
  detail,
  update,
} from "../controllers/curriculum.controller.js";

const router = Router();

router.get(
  "/",
  optionalAuthenticate,
  //   validateRequest(listCurriculumsQuerySchema, "query"),
  list
);

router.post(
  "/",
  authenticate,
  ensureTeacher,
  validateRequest(createCurriculumSchema),
  create
);

router.get(
  "/:curriculumId",
  optionalAuthenticate,
  validateRequest(curriculumIdParamSchema, "params"),
  //   validateRequest(curriculumDetailQuerySchema, "query"),
  detail
);

router.patch(
  "/:curriculumId",
  authenticate,
  ensureTeacher,
  validateRequest(curriculumIdParamSchema, "params"),
  validateRequest(updateCurriculumSchema),
  update
);

export default router;
