import { createdResponse, successResponse } from "../utils/apiResponse.js";
import { asyncHandler, pick } from "../utils/helpers.js";
import {
  createLesson,
  listLessons,
  updateLesson,
} from "../services/lesson.service.js";
import {
  uploadLessonVideo,
  getLessonVideo,
} from "../services/video.service.js";

export const create = asyncHandler(async (req, res) => {
  const payload = pick(req.body, [
    "title",
    "description",
    "courseId",
    "order",
    "resources",
  ]);
  const lesson = await createLesson(payload, req.user);
  return createdResponse(res, { lesson }, "Lesson created successfully");
});

export const list = asyncHandler(async (req, res) => {
  const lessons = await listLessons(req.query, req.user);
  return successResponse(res, { lessons });
});

export const update = asyncHandler(async (req, res) => {
  const payload = pick(req.body, [
    "title",
    "description",
    "order",
    "resources",
  ]);
  const lesson = await updateLesson(req.params.lessonId, payload, req.user);
  return successResponse(res, { lesson }, "Lesson updated successfully");
});

export const uploadVideo = asyncHandler(async (req, res) => {
  const video = await uploadLessonVideo({
    lessonId: req.params.lessonId,
    user: req.user,
    file: req.file,
    uploadContext: req.videoUploadContext,
  });

  return createdResponse(res, { video }, "Video uploaded successfully");
});

export const getVideo = asyncHandler(async (req, res) => {
  const video = await getLessonVideo(req.params.lessonId, req.user);
  return successResponse(res, { video });
});

export default {
  create,
  list,
  update,
  uploadVideo,
  getVideo,
};
