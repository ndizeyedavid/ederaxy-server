import ApiError from "../utils/apiError.js";
import Course from "../models/course.model.js";
import Lesson from "../models/lesson.model.js";
import { USER_ROLES } from "../utils/constants.js";

const isTeacher = (user) => Boolean(user && user.role === USER_ROLES.TEACHER);

const isOwner = (ownerId, user) =>
  Boolean(isTeacher(user) && ownerId?.toString() === user?._id?.toString());

const assertCourseOwnership = async (courseId, user) => {
  const course = await Course.findById(courseId).populate({
    path: "teacher",
    select: "_id role",
  });

  if (!course) {
    throw ApiError.notFound("Course not found");
  }

  if (!isOwner(course.teacher?._id ?? course.teacher, user)) {
    throw ApiError.forbidden(
      "You do not have permission to modify lessons for this course"
    );
  }

  return course;
};

export const createLesson = async (payload, user) => {
  await assertCourseOwnership(payload.courseId, user);

  try {
    const lesson = await Lesson.create({
      title: payload.title,
      description: payload.description,
      course: payload.courseId,
      order: payload.order,
      resources: payload.resources ?? [],
    });

    return lesson;
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict(
        "Lesson order or title already exists for this course"
      );
    }

    throw error;
  }
};

export const listLessons = async ({ courseId }, user) => {
  const course = await Course.findById(courseId)
    .select("teacher isPublished")
    .populate({ path: "teacher", select: "_id role" });

  if (!course) {
    throw ApiError.notFound("Course not found");
  }

  const owner = isOwner(course.teacher?._id ?? course.teacher, user);

  if (!course.isPublished && !owner) {
    throw ApiError.forbidden("This course is not available");
  }

  const lessons = await Lesson.find({ course: courseId })
    .sort({ order: 1 })
    .select("title description order resources video createdAt updatedAt")
    .lean();

  return lessons;
};

export const updateLesson = async (lessonId, payload, user) => {
  const lesson = await Lesson.findById(lessonId).populate({
    path: "course",
    populate: { path: "teacher", select: "_id" },
  });

  if (!lesson) {
    throw ApiError.notFound("Lesson not found");
  }

  const courseOwnerId = lesson.course?.teacher?._id ?? lesson.course?.teacher;

  if (!isOwner(courseOwnerId, user)) {
    throw ApiError.forbidden(
      "You do not have permission to update this lesson"
    );
  }

  if (payload.title !== undefined) {
    lesson.title = payload.title;
  }

  if (payload.description !== undefined) {
    lesson.description = payload.description;
  }

  if (payload.order !== undefined) {
    lesson.order = payload.order;
  }

  if (payload.resources !== undefined) {
    lesson.resources = payload.resources;
  }

  try {
    await lesson.save();
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict(
        "Lesson order or title already exists for this course"
      );
    }

    throw error;
  }

  return lesson;
};

export default {
  createLesson,
  listLessons,
  updateLesson,
};
