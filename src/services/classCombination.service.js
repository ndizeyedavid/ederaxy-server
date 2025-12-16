import ApiError from "../utils/apiError.js";
import ClassCombination from "../models/classCombination.model.js";
import Subject from "../models/subject.model.js";

const ensureSubjectsExist = async (subjects = []) => {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return [];
  }

  const uniqueSubjects = [...new Set(subjects)];
  const count = await Subject.countDocuments({ _id: { $in: uniqueSubjects } });

  if (count !== uniqueSubjects.length) {
    throw ApiError.badRequest("One or more subjects were not found");
  }

  return uniqueSubjects;
};

export const createClassCombination = async (payload) => {
  const subjects = await ensureSubjectsExist(payload.subjects);

  try {
    const combination = await ClassCombination.create({
      name: payload.name,
      code: payload.code,
      description: payload.description,
      type: payload.type,
      subjects,
    });

    return combination;
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict("Class combination code already exists");
    }

    throw error;
  }
};

export const listClassCombinations = async ({ type, includeSubjects } = {}) => {
  const filter = {};

  if (type) {
    filter.type = type;
  }

  let query = ClassCombination.find(filter)
    .sort({ name: 1 })
    .select("name code type description subjects createdAt updatedAt");

  if (includeSubjects) {
    query = query.populate({ path: "subjects", select: "title curriculum" });
  }

  const combinations = await query.lean();
  return combinations;
};

export const getClassCombinationById = async (
  combinationId,
  { includeSubjects } = {}
) => {
  let query = ClassCombination.findById(combinationId).select(
    "name code type description subjects createdAt updatedAt"
  );

  if (includeSubjects) {
    query = query.populate({ path: "subjects", select: "title curriculum" });
  }

  const combination = await query.lean();

  if (!combination) {
    throw ApiError.notFound("Class combination not found");
  }

  return combination;
};

export const updateClassCombination = async (combinationId, payload) => {
  const combination = await ClassCombination.findById(combinationId);

  if (!combination) {
    throw ApiError.notFound("Class combination not found");
  }

  if (payload.name !== undefined) {
    combination.name = payload.name;
  }

  if (payload.code !== undefined) {
    combination.code = payload.code;
  }

  if (payload.description !== undefined) {
    combination.description = payload.description;
  }

  if (payload.type !== undefined) {
    combination.type = payload.type;
  }

  if (payload.subjects !== undefined) {
    combination.subjects = await ensureSubjectsExist(payload.subjects);
  }

  try {
    await combination.save();
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict("Class combination code already exists");
    }

    throw error;
  }

  return combination;
};

export default {
  createClassCombination,
  listClassCombinations,
  getClassCombinationById,
  updateClassCombination,
};
