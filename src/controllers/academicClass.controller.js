import { createdResponse, successResponse } from "../utils/apiResponse.js";
import { asyncHandler, pick } from "../utils/helpers.js";
import {
  createAcademicClass,
  listAcademicClasses,
  getAcademicClassById,
  updateAcademicClass,
} from "../services/academicClass.service.js";

export const create = asyncHandler(async (req, res) => {
  const payload = pick(req.body, [
    "name",
    "code",
    "description",
    "levelId",
    "order",
    "combinationIds",
  ]);
  const academicClass = await createAcademicClass(payload);
  return createdResponse(
    res,
    { academicClass },
    "Academic class created successfully"
  );
});

export const list = asyncHandler(async (req, res) => {
  const filters = pick(req.query, ["levelId", "includeCombinations"]);
  const classes = await listAcademicClasses(filters);
  return successResponse(res, { classes });
});

export const detail = asyncHandler(async (req, res) => {
  const options = pick(req.query, ["includeCombinations"]);
  const academicClass = await getAcademicClassById(req.params.classId, options);
  return successResponse(res, { academicClass });
});

export const update = asyncHandler(async (req, res) => {
  const payload = pick(req.body, [
    "name",
    "code",
    "description",
    "levelId",
    "order",
    "combinationIds",
  ]);
  const academicClass = await updateAcademicClass(req.params.classId, payload);
  return successResponse(
    res,
    { academicClass },
    "Academic class updated successfully"
  );
});

export default {
  create,
  list,
  detail,
  update,
};
