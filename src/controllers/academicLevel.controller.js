import { createdResponse, successResponse } from "../utils/apiResponse.js";
import { asyncHandler, pick } from "../utils/helpers.js";
import {
  createAcademicLevel,
  listAcademicLevels,
  getAcademicLevelById,
  updateAcademicLevel,
} from "../services/academicLevel.service.js";

export const create = asyncHandler(async (req, res) => {
  const payload = pick(req.body, [
    "name",
    "description",
    "stage",
    "curriculumId",
    "order",
  ]);
  const level = await createAcademicLevel(payload);
  return createdResponse(res, { level }, "Academic level created successfully");
});

export const list = asyncHandler(async (req, res) => {
  const filters = pick(req.query, ["curriculumId", "includeClasses"]);
  const levels = await listAcademicLevels(filters);
  return successResponse(res, { levels });
});

export const detail = asyncHandler(async (req, res) => {
  const options = pick(req.query, ["includeClasses"]);
  const level = await getAcademicLevelById(req.params.levelId, options);
  return successResponse(res, { level });
});

export const update = asyncHandler(async (req, res) => {
  const payload = pick(req.body, [
    "name",
    "description",
    "stage",
    "curriculumId",
    "order",
  ]);
  const level = await updateAcademicLevel(req.params.levelId, payload);
  return successResponse(res, { level }, "Academic level updated successfully");
});

export default {
  create,
  list,
  detail,
  update,
};
