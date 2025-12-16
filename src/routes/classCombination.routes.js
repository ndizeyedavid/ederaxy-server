import { Router } from "express";

import validateRequest from "../middleware/validate.middleware.js";
import {
  authenticate,
  optionalAuthenticate,
} from "../middleware/auth.middleware.js";
import { ensureTeacher } from "../middleware/role.middleware.js";
import {
  createClassCombinationSchema,
  updateClassCombinationSchema,
  classCombinationIdParamSchema,
  listClassCombinationsQuerySchema,
  classCombinationDetailQuerySchema,
} from "../validations/classCombination.validation.js";
import {
  create,
  list,
  detail,
  update,
} from "../controllers/classCombination.controller.js";

const router = Router();

router.get(
  "/",
  optionalAuthenticate,
  validateRequest(listClassCombinationsQuerySchema, "query"),
  list
);

router.post(
  "/",
  authenticate,
  ensureTeacher,
  validateRequest(createClassCombinationSchema),
  create
);

router.get(
  "/:combinationId",
  optionalAuthenticate,
  validateRequest(classCombinationIdParamSchema, "params"),
  validateRequest(classCombinationDetailQuerySchema, "query"),
  detail
);

router.patch(
  "/:combinationId",
  authenticate,
  ensureTeacher,
  validateRequest(classCombinationIdParamSchema, "params"),
  validateRequest(updateClassCombinationSchema),
  update
);

export default router;
