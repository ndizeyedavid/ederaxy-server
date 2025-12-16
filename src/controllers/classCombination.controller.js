import { createdResponse, successResponse } from "../utils/apiResponse.js";
import { asyncHandler, pick } from "../utils/helpers.js";
import {
  createClassCombination,
  listClassCombinations,
  getClassCombinationById,
  updateClassCombination,
} from "../services/classCombination.service.js";

export const create = asyncHandler(async (req, res) => {
  const payload = pick(req.body, [
    "name",
    "code",
    "description",
    "type",
    "subjects",
  ]);
  const combination = await createClassCombination(payload);
  return createdResponse(
    res,
    { combination },
    "Class combination created successfully"
  );
});

export const list = asyncHandler(async (req, res) => {
  const filters = pick(req.query, ["type", "includeSubjects"]);
  const combinations = await listClassCombinations(filters);
  return successResponse(res, { combinations });
});

export const detail = asyncHandler(async (req, res) => {
  const options = pick(req.query, ["includeSubjects"]);
  const combination = await getClassCombinationById(
    req.params.combinationId,
    options
  );
  return successResponse(res, { combination });
});

export const update = asyncHandler(async (req, res) => {
  const payload = pick(req.body, [
    "name",
    "code",
    "description",
    "type",
    "subjects",
  ]);
  const combination = await updateClassCombination(
    req.params.combinationId,
    payload
  );
  return successResponse(
    res,
    { combination },
    "Class combination updated successfully"
  );
});

export default {
  create,
  list,
  detail,
  update,
};
