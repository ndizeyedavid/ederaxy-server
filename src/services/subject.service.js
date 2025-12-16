import ApiError from "../utils/apiError.js";
import Subject from "../models/subject.model.js";
import Course from "../models/course.model.js";
import Curriculum from "../models/curriculum.model.js";
import AcademicLevel from "../models/academicLevel.model.js";
import AcademicClass from "../models/academicClass.model.js";
import ClassCombination from "../models/classCombination.model.js";
import { USER_ROLES } from "../utils/constants.js";

const isOwner = (entityOwnerId, user) =>
  Boolean(
    user &&
      user.role === USER_ROLES.TEACHER &&
      entityOwnerId.toString() === user._id.toString()
  );

const ensureIdsExist = async (Model, ids, notFoundMessage, filter = {}) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }

  const uniqueIds = [...new Set(ids)];
  const docs = await Model.find({ _id: { $in: uniqueIds }, ...filter })
    .select("_id")
    .lean();

  if (docs.length !== uniqueIds.length) {
    throw ApiError.badRequest(notFoundMessage);
  }

  return uniqueIds;
};

export const createSubject = async (payload, user) => {
  try {
    const curriculum = await Curriculum.findById(payload.curriculumId);

    if (!curriculum) {
      throw ApiError.badRequest("Curriculum not found");
    }

    const targetLevelIds = await ensureIdsExist(
      AcademicLevel,
      payload.targetLevelIds,
      "One or more academic levels were not found",
      { curriculum: curriculum._id }
    );

    const classFilter = targetLevelIds.length
      ? { level: { $in: targetLevelIds } }
      : undefined;

    const targetClassIds = await ensureIdsExist(
      AcademicClass,
      payload.targetClassIds,
      "One or more academic classes were not found",
      classFilter ?? {}
    );

    const targetCombinationIds = await ensureIdsExist(
      ClassCombination,
      payload.targetCombinationIds,
      "One or more class combinations were not found"
    );

    const subject = await Subject.create({
      title: payload.title,
      description: payload.description,
      curriculum: curriculum._id,
      targetLevels: targetLevelIds,
      targetClasses: targetClassIds,
      targetCombinations: targetCombinationIds,
      createdBy: user._id,
    });

    return subject;
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict("Subject title already exists");
    }

    throw error;
  }
};

export const listSubjects = async ({ teacherId, curriculumId } = {}) => {
  const filter = {};

  if (teacherId) {
    filter.createdBy = teacherId;
  }

  if (curriculumId) {
    filter.curriculum = curriculumId;
  }

  const subjects = await Subject.find(filter)
    .sort({ title: 1 })
    .populate({ path: "curriculum", select: "name slug country" })
    .populate({ path: "targetLevels", select: "name slug stage order" })
    .populate({ path: "targetClasses", select: "name code order" })
    .populate({ path: "targetCombinations", select: "name code type" })
    .select(
      "title description curriculum targetLevels targetClasses targetCombinations createdBy createdAt updatedAt"
    )
    .lean();
  return subjects;
};

export const getSubjectById = async (subjectId, user) => {
  const subject = await Subject.findById(subjectId)
    .populate({ path: "curriculum", select: "name slug country" })
    .populate({ path: "targetLevels", select: "name slug stage order" })
    .populate({ path: "targetClasses", select: "name code order" })
    .populate({ path: "targetCombinations", select: "name code type" })
    .lean({ virtuals: true });

  if (!subject) {
    throw ApiError.notFound("Subject not found");
  }

  const owner = isOwner(subject.createdBy, user);

  const courseQuery = { subject: subject._id };

  if (!owner) {
    courseQuery.isPublished = true;
  }

  const courses = await Course.find(courseQuery)
    .sort({ title: 1 })
    .select("title description teacher subject isPublished createdAt updatedAt")
    .lean();

  return {
    subject,
    courses,
  };
};

export const updateSubject = async (subjectId, payload, user) => {
  const subject = await Subject.findById(subjectId);

  if (!subject) {
    throw ApiError.notFound("Subject not found");
  }

  if (!isOwner(subject.createdBy, user)) {
    throw ApiError.forbidden(
      "You do not have permission to update this subject"
    );
  }

  if (payload.title !== undefined) {
    subject.title = payload.title;
  }

  if (payload.description !== undefined) {
    subject.description = payload.description;
  }

  if (payload.curriculumId) {
    const curriculum = await Curriculum.findById(payload.curriculumId);

    if (!curriculum) {
      throw ApiError.badRequest("Curriculum not found");
    }

    subject.curriculum = curriculum._id;
  }

  if (payload.targetLevelIds !== undefined) {
    subject.targetLevels = await ensureIdsExist(
      AcademicLevel,
      payload.targetLevelIds,
      "One or more academic levels were not found",
      subject.curriculum ? { curriculum: subject.curriculum } : {}
    );
  }

  if (payload.targetClassIds !== undefined) {
    const classFilter = subject.targetLevels.length
      ? { level: { $in: subject.targetLevels } }
      : undefined;

    subject.targetClasses = await ensureIdsExist(
      AcademicClass,
      payload.targetClassIds,
      "One or more academic classes were not found",
      classFilter ?? {}
    );
  }

  if (payload.targetCombinationIds !== undefined) {
    subject.targetCombinations = await ensureIdsExist(
      ClassCombination,
      payload.targetCombinationIds,
      "One or more class combinations were not found"
    );
  }

  try {
    await subject.save();
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict("Subject title already exists");
    }

    throw error;
  }

  return subject;
};

export default {
  createSubject,
  listSubjects,
  getSubjectById,
  updateSubject,
};
