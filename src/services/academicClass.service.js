import ApiError from "../utils/apiError.js";
import AcademicClass from "../models/academicClass.model.js";
import AcademicLevel from "../models/academicLevel.model.js";
import ClassCombination from "../models/classCombination.model.js";

const ensureCombinationsExist = async (combinationIds = []) => {
  if (!Array.isArray(combinationIds) || combinationIds.length === 0) {
    return [];
  }

  const uniqueIds = [...new Set(combinationIds)];
  const count = await ClassCombination.countDocuments({
    _id: { $in: uniqueIds },
  });

  if (count !== uniqueIds.length) {
    throw ApiError.badRequest("One or more class combinations were not found");
  }

  return uniqueIds;
};

export const createAcademicClass = async (payload) => {
  const level = await AcademicLevel.findById(payload.levelId);

  if (!level) {
    throw ApiError.badRequest("Academic level not found");
  }

  const nextOrder =
    payload.order ?? (await AcademicClass.countDocuments({ level: level._id }));

  const combinationIds = await ensureCombinationsExist(payload.combinationIds);

  try {
    const academicClass = await AcademicClass.create({
      name: payload.name,
      code: payload.code,
      description: payload.description,
      level: level._id,
      order: nextOrder,
      combinations: combinationIds,
    });

    return academicClass;
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict("Class code already exists for this level");
    }

    throw error;
  }
};

export const listAcademicClasses = async ({
  levelId,
  includeCombinations,
} = {}) => {
  const filter = {};

  if (levelId) {
    filter.level = levelId;
  }

  let query = AcademicClass.find(filter)
    .sort({ order: 1, createdAt: 1 })
    .select(
      "name code description level order combinations createdAt updatedAt"
    )
    .populate({ path: "level", select: "name slug stage curriculum" });

  if (includeCombinations) {
    query = query.populate({
      path: "combinations",
      select: "name code type subjects",
    });
  }

  const classes = await query.lean();
  return classes;
};

export const getAcademicClassById = async (
  classId,
  { includeCombinations } = {}
) => {
  let query = AcademicClass.findById(classId)
    .select(
      "name code description level order combinations createdAt updatedAt"
    )
    .populate({ path: "level", select: "name slug stage curriculum" });

  if (includeCombinations) {
    query = query.populate({ path: "combinations", select: "name code type" });
  }

  const academicClass = await query.lean();

  if (!academicClass) {
    throw ApiError.notFound("Academic class not found");
  }

  return academicClass;
};

export const updateAcademicClass = async (classId, payload) => {
  const academicClass = await AcademicClass.findById(classId);

  if (!academicClass) {
    throw ApiError.notFound("Academic class not found");
  }

  if (payload.name !== undefined) {
    academicClass.name = payload.name;
  }

  if (payload.code !== undefined) {
    academicClass.code = payload.code;
  }

  if (payload.description !== undefined) {
    academicClass.description = payload.description;
  }

  if (payload.levelId !== undefined) {
    const level = await AcademicLevel.findById(payload.levelId);

    if (!level) {
      throw ApiError.badRequest("Academic level not found");
    }

    academicClass.level = level._id;
  }

  if (payload.order !== undefined) {
    academicClass.order = payload.order;
  }

  if (payload.combinationIds !== undefined) {
    academicClass.combinations = await ensureCombinationsExist(
      payload.combinationIds
    );
  }

  try {
    await academicClass.save();
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict("Class code already exists for this level");
    }

    throw error;
  }

  return academicClass;
};

export default {
  createAcademicClass,
  listAcademicClasses,
  getAcademicClassById,
  updateAcademicClass,
};
