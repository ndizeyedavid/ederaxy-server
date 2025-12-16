import ApiError from "../utils/apiError.js";
import { createdResponse, successResponse } from "../utils/apiResponse.js";
import { asyncHandler, pick } from "../utils/helpers.js";
import {
  createSubject,
  listSubjects,
  getSubjectById,
  updateSubject,
} from "../services/subject.service.js";

export const create = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  const payload = pick(req.body, [
    "title",
    "description",
    "curriculumId",
    "targetLevelIds",
    "targetClassIds",
    "targetCombinationIds",
  ]);
  const subject = await createSubject(payload, req.user);
  return createdResponse(res, { subject }, "Subject created successfully");
});

export const list = asyncHandler(async (req, res) => {
  const subjects = await listSubjects(req.params);
  return successResponse(res, { subjects });
});

export const detail = asyncHandler(async (req, res) => {
  const result = await getSubjectById(req.params.subjectId, req.user);
  return successResponse(res, result);
});

export const update = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  const payload = pick(req.body, [
    "title",
    "description",
    "curriculumId",
    "targetLevelIds",
    "targetClassIds",
    "targetCombinationIds",
  ]);
  const subject = await updateSubject(req.params.subjectId, payload, req.user);
  return successResponse(res, { subject }, "Subject updated successfully");
});

export default {
  create,
  list,
  detail,
  update,
};
