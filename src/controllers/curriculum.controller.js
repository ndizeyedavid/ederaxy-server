import { createdResponse, successResponse } from "../utils/apiResponse.js";
import { asyncHandler, pick } from "../utils/helpers.js";
import {
  createCurriculum,
  listCurriculums,
  getCurriculumById,
  updateCurriculum,
} from "../services/curriculum.service.js";

export const create = asyncHandler(async (req, res) => {
  const payload = pick(req.body, ["name", "description", "country"]);
  const curriculum = await createCurriculum(payload);
  return createdResponse(
    res,
    { curriculum },
    "Curriculum created successfully"
  );
});

export const list = asyncHandler(async (req, res) => {
  const filters = pick(req.query, ["includeHierarchy"]);
  const curriculums = await listCurriculums(filters);
  return successResponse(res, { curriculums });
});

export const detail = asyncHandler(async (req, res) => {
  const options = pick(req.query, ["includeHierarchy"]);
  const curriculum = await getCurriculumById(req.params.curriculumId, options);
  return successResponse(res, { curriculum });
});

export const update = asyncHandler(async (req, res) => {
  const payload = pick(req.body, ["name", "description", "country"]);
  const curriculum = await updateCurriculum(req.params.curriculumId, payload);
  return successResponse(
    res,
    { curriculum },
    "Curriculum updated successfully"
  );
});

export default {
  create,
  list,
  detail,
  update,
};
