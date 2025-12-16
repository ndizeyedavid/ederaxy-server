import { z } from "zod";

import { OBJECT_ID_REGEX } from "../utils/constants.js";

const titleSchema = z
  .string({ required_error: "Title is required" })
  .min(2, "Title must be at least 2 characters long")
  .max(200, "Title must be at most 200 characters long")
  .transform((value) => value.trim());

const descriptionSchema = z
  .string()
  .max(2000, "Description must be at most 2000 characters long")
  .transform((value) => value.trim())
  .optional()
  .or(z.literal("").transform(() => ""));

export const createCourseSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  subjectId: z
    .string({ required_error: "Subject ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid subject identifier"),
  isPublished: z.boolean().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const listCourseSchema = z
  .object({
    subjectId: z
      .string()
      .regex(OBJECT_ID_REGEX, "Invalid subject identifier")
      .optional(),
    teacherId: z
      .string()
      .regex(OBJECT_ID_REGEX, "Invalid teacher identifier")
      .optional(),
  })
  .optional();

export const courseIdParamSchema = z.object({
  courseId: z
    .string({ required_error: "Course ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid course identifier"),
});

export default {
  createCourseSchema,
  updateCourseSchema,
  listCourseSchema,
  courseIdParamSchema,
};
