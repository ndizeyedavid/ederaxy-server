import ApiError from "../utils/apiError.js";
import AcademicLevel from "../models/academicLevel.model.js";
import AcademicClass from "../models/academicClass.model.js";
import Curriculum from "../models/curriculum.model.js";
import { slugify } from "../utils/helpers.js";

const attachClasses = async (levels) => {
  if (!levels.length) {
    return levels;
  }

  const levelIds = levels.map((level) => level._id);
  const classes = await AcademicClass.find({ level: { $in: levelIds } })
    .sort({ order: 1, createdAt: 1 })
    .populate({ path: "combinations", select: "name code type" })
    .lean();

  const classesByLevel = classes.reduce((acc, item) => {
    const key = item.level?.toString();
    if (!key) return acc;
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key).push(item);
    return acc;
  }, new Map());

  return levels.map((level) => ({
    ...level,
    classes: classesByLevel.get(level._id.toString()) ?? [],
  }));
};

export const createAcademicLevel = async (payload) => {
  const curriculum = await Curriculum.findById(payload.curriculumId);

  if (!curriculum) {
    throw ApiError.badRequest("Curriculum not found");
  }

  const slug = slugify(payload.name);
  const baseFilter = { curriculum: curriculum._id };

  const nextOrder =
    payload.order ?? (await AcademicLevel.countDocuments(baseFilter));

  try {
    const level = await AcademicLevel.create({
      name: payload.name,
      slug,
      description: payload.description,
      stage: payload.stage,
      curriculum: curriculum._id,
      order: nextOrder,
    });

    return level;
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict(
        "Academic level already exists for this curriculum"
      );
    }

    throw error;
  }
};

export const listAcademicLevels = async ({
  curriculumId,
  includeClasses,
} = {}) => {
  const filter = {};

  if (curriculumId) {
    filter.curriculum = curriculumId;
  }

  const levels = await AcademicLevel.find(filter)
    .sort({ order: 1, createdAt: 1 })
    .select("name slug description stage curriculum order createdAt updatedAt")
    .lean();

  if (!includeClasses) {
    return levels;
  }

  return attachClasses(levels);
};

export const getAcademicLevelById = async (
  levelId,
  { includeClasses } = {}
) => {
  const level = await AcademicLevel.findById(levelId)
    .select("name slug description stage curriculum order createdAt updatedAt")
    .lean();

  if (!level) {
    throw ApiError.notFound("Academic level not found");
  }

  if (!includeClasses) {
    return level;
  }

  const [withClasses] = await attachClasses([level]);
  return withClasses ?? level;
};

export const updateAcademicLevel = async (levelId, payload) => {
  const level = await AcademicLevel.findById(levelId);

  if (!level) {
    throw ApiError.notFound("Academic level not found");
  }

  if (payload.name !== undefined) {
    level.name = payload.name;
    level.slug = slugify(payload.name);
  }

  if (payload.description !== undefined) {
    level.description = payload.description;
  }

  if (payload.stage !== undefined) {
    level.stage = payload.stage;
  }

  if (payload.curriculumId !== undefined) {
    const curriculum = await Curriculum.findById(payload.curriculumId);

    if (!curriculum) {
      throw ApiError.badRequest("Curriculum not found");
    }

    level.curriculum = curriculum._id;
  }

  if (payload.order !== undefined) {
    level.order = payload.order;
  }

  try {
    await level.save();
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict(
        "Academic level already exists for this curriculum"
      );
    }

    throw error;
  }

  return level;
};

export default {
  createAcademicLevel,
  listAcademicLevels,
  getAcademicLevelById,
  updateAcademicLevel,
};
