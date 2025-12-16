import ApiError from "../utils/apiError.js";
import Curriculum from "../models/curriculum.model.js";
import AcademicLevel from "../models/academicLevel.model.js";
import AcademicClass from "../models/academicClass.model.js";
import { slugify } from "../utils/helpers.js";

const buildHierarchy = async (curriculums) => {
  if (!curriculums.length) {
    return curriculums;
  }

  const curriculumIds = curriculums.map((curriculum) => curriculum._id);

  const levels = await AcademicLevel.find({
    curriculum: { $in: curriculumIds },
  })
    .sort({ order: 1, createdAt: 1 })
    .lean();

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

  const levelsByCurriculum = levels.reduce((acc, item) => {
    const key = item.curriculum?.toString();
    if (!key) return acc;

    const levelWithClasses = {
      ...item,
      classes: classesByLevel.get(item._id.toString()) ?? [],
    };

    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key).push(levelWithClasses);
    return acc;
  }, new Map());

  return curriculums.map((curriculum) => ({
    ...curriculum,
    levels: levelsByCurriculum.get(curriculum._id.toString()) ?? [],
  }));
};

export const createCurriculum = async (payload) => {
  const slug = slugify(payload.name);

  try {
    const curriculum = await Curriculum.create({
      name: payload.name,
      description: payload.description,
      country: payload.country ?? "Rwanda",
      slug,
    });

    return curriculum;
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict("Curriculum already exists");
    }

    throw error;
  }
};

export const listCurriculums = async ({ includeHierarchy } = {}) => {
  const curriculums = await Curriculum.find()
    .sort({ name: 1 })
    .select("name description country slug createdAt updatedAt")
    .lean();

  if (!includeHierarchy) {
    return curriculums;
  }

  return buildHierarchy(curriculums);
};

export const getCurriculumById = async (
  curriculumId,
  { includeHierarchy } = {}
) => {
  const curriculum = await Curriculum.findById(curriculumId)
    .select("name description country slug createdAt updatedAt")
    .lean();

  if (!curriculum) {
    throw ApiError.notFound("Curriculum not found");
  }

  if (!includeHierarchy) {
    return curriculum;
  }

  const [withHierarchy] = await buildHierarchy([curriculum]);
  return withHierarchy ?? curriculum;
};

export const updateCurriculum = async (curriculumId, payload) => {
  const curriculum = await Curriculum.findById(curriculumId);

  if (!curriculum) {
    throw ApiError.notFound("Curriculum not found");
  }

  if (payload.name !== undefined) {
    curriculum.name = payload.name;
    curriculum.slug = slugify(payload.name);
  }

  if (payload.description !== undefined) {
    curriculum.description = payload.description;
  }

  if (payload.country !== undefined) {
    curriculum.country = payload.country;
  }

  try {
    await curriculum.save();
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict("Curriculum already exists");
    }

    throw error;
  }

  return curriculum;
};

export default {
  createCurriculum,
  listCurriculums,
  getCurriculumById,
  updateCurriculum,
};
