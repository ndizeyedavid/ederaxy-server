import { createdResponse, successResponse } from "../utils/apiResponse.js";
import { asyncHandler, pick } from "../utils/helpers.js";
import {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
} from "../services/course.service.js";

export const create = asyncHandler(async (req, res) => {
  const payload = pick(req.body, [
    "title",
    "description",
    "subjectId",
    "isPublished",
  ]);
  const course = await createCourse(payload, req.user);
  return createdResponse(res, { course }, "Course created successfully");
});

export const list = asyncHandler(async (req, res) => {
  const filters = pick(req.query, ["subjectId", "teacherId"]);
  const courses = await listCourses(filters, req.user);
  console.log(filters);
  return successResponse(res, { courses });
});

export const detail = asyncHandler(async (req, res) => {
  const course = await getCourseById(req.params.courseId, req.user);
  return successResponse(res, course);
});

export const update = asyncHandler(async (req, res) => {
  const payload = pick(req.body, [
    "title",
    "description",
    "subjectId",
    "isPublished",
  ]);
  const course = await updateCourse(req.params.courseId, payload, req.user);
  return successResponse(res, { course }, "Course updated successfully");
});

export default {
  create,
  list,
  detail,
  update,
};
