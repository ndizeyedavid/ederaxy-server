import ApiError from "../utils/apiError.js";
import Subject from "../models/subject.model.js";
import Course from "../models/course.model.js";
import Lesson from "../models/lesson.model.js";
import { USER_ROLES } from "../utils/constants.js";

const isTeacher = (user) => Boolean(user && user.role === USER_ROLES.TEACHER);

const isOwner = (ownerId, user) =>
  Boolean(isTeacher(user) && ownerId?.toString() === user?._id?.toString());

const assertSubjectOwnership = async (subjectId, user) => {
  const subject = await Subject.findById(subjectId);

  if (!subject) {
    throw ApiError.notFound("Subject not found");
  }

  if (!isOwner(subject.createdBy, user)) {
    throw ApiError.forbidden("You do not have permission to use this subject");
  }

  return subject;
};

export const createCourse = async (payload, user) => {
  await assertSubjectOwnership(payload.subjectId, user);

  try {
    const course = await Course.create({
      title: payload.title,
      description: payload.description,
      subject: payload.subjectId,
      teacher: user._id,
      isPublished: payload.isPublished ?? false,
    });

    return course;
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict("Course title already exists for this subject");
    }

    throw error;
  }
};

export const listCourses = async ({ subjectId, teacherId } = {}, user) => {
  const filter = {};

  if (subjectId) {
    filter.subject = subjectId;
  }

  if (teacherId) {
    filter.teacher = teacherId;
  }

  const isOwnCoursesQuery =
    isTeacher(user) && (!teacherId || teacherId === user._id.toString());

  if (!isOwnCoursesQuery) {
    filter.isPublished = true;
  }

  const courses = await Course.find(filter)
    .sort({ title: 1 })
    .populate({ path: "subject", select: "title description" })
    .populate({ path: "teacher", select: "fullName email" })
    .lean();

  return courses;
};

export const getCourseById = async (courseId, user) => {
  const course = await Course.findById(courseId)
    .populate({ path: "subject", select: "title description createdBy" })
    .populate({ path: "teacher", select: "fullName email" })
    .lean();

  if (!course) {
    throw ApiError.notFound("Course not found");
  }

  const owner = isOwner(course.teacher?._id ?? course.teacher, user);

  if (!course.isPublished && !owner) {
    throw ApiError.forbidden("This course is not available");
  }

  const lessons = await Lesson.find({ course: course._id })
    .sort({ order: 1 })
    .select("title description order resources video createdAt updatedAt")
    .lean();

  return { course, lessons };
};

export const updateCourse = async (courseId, payload, user) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw ApiError.notFound("Course not found");
  }

  if (!isOwner(course.teacher, user)) {
    throw ApiError.forbidden(
      "You do not have permission to update this course"
    );
  }

  if (payload.subjectId) {
    await assertSubjectOwnership(payload.subjectId, user);
    course.subject = payload.subjectId;
  }

  if (payload.title !== undefined) {
    course.title = payload.title;
  }

  if (payload.description !== undefined) {
    course.description = payload.description;
  }

  if (payload.isPublished !== undefined) {
    course.isPublished = payload.isPublished;
  }

  try {
    await course.save();
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict("Course title already exists for this subject");
    }

    throw error;
  }

  return course;
};

export default {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
};
