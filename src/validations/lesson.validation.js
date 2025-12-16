import { z } from "zod";

import { OBJECT_ID_REGEX } from "../utils/constants.js";

const titleSchema = z
  .string({ required_error: "Title is required" })
  .min(2, "Title must be at least 2 characters long")
  .max(200, "Title must be at most 200 characters long")
  .transform((value) => value.trim());

const descriptionSchema = z
  .string()
  .max(4000, "Description must be at most 4000 characters long")
  .transform((value) => value.trim())
  .optional()
  .or(z.literal("").transform(() => ""));

const orderSchema = z
  .number({ required_error: "Order is required" })
  .int("Order must be an integer value")
  .min(1, "Order must be at least 1");

export const createLessonSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  courseId: z
    .string({ required_error: "Course ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid course identifier"),
  order: orderSchema,
  resources: z
    .array(
      z.object({
        label: z
          .string()
          .min(1)
          .max(120)
          .transform((value) => value.trim()),
        url: z.string().url("Resource URL must be valid"),
      })
    )
    .optional(),
});

export const updateLessonSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema,
    order: orderSchema.optional(),
    resources: z
      .array(
        z.object({
          label: z
            .string()
            .min(1)
            .max(120)
            .transform((value) => value.trim()),
          url: z.string().url("Resource URL must be valid"),
        })
      )
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
  );

export const lessonIdParamSchema = z.object({
  lessonId: z
    .string({ required_error: "Lesson ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid lesson identifier"),
});

export const listLessonSchema = z.object({
  courseId: z
    .string({ required_error: "Course ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid course identifier"),
});

export default {
  createLessonSchema,
  updateLessonSchema,
  lessonIdParamSchema,
  listLessonSchema,
};
