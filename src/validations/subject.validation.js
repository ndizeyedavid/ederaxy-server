import { z } from "zod";

import { OBJECT_ID_REGEX } from "../utils/constants.js";

const titleSchema = z
  .string({ required_error: "Title is required" })
  .min(2, "Title must be at least 2 characters long")
  .max(120, "Title must be at most 120 characters long")
  .transform((value) => value.trim());

const descriptionSchema = z
  .string()
  .max(1000, "Description must be at most 1000 characters long")
  .transform((value) => value.trim())
  .optional()
  .or(z.literal("").transform(() => ""));

const objectIdArraySchema = (field) =>
  z
    .array(z.string().regex(OBJECT_ID_REGEX, `Invalid ${field} identifier`))
    .optional()
    .transform((value) => value ?? []);

export const createSubjectSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  curriculumId: z
    .string({ required_error: "Curriculum ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid curriculum identifier"),
  targetLevelIds: objectIdArraySchema("level"),
  targetClassIds: objectIdArraySchema("class"),
  targetCombinationIds: objectIdArraySchema("combination"),
});

export const updateSubjectSchema = createSubjectSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required to update"
  );

export const subjectIdParamSchema = z.object({
  subjectId: z
    .string({ required_error: "Subject ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid subject identifier"),
});

export const listSubjectsQuerySchema = z.object({
  teacherId: z
    .string()
    .regex(OBJECT_ID_REGEX, "Invalid teacher identifier")
    .optional(),
  curriculumId: z
    .string()
    .regex(OBJECT_ID_REGEX, "Invalid curriculum identifier")
    .optional(),
});

export default {
  createSubjectSchema,
  updateSubjectSchema,
  subjectIdParamSchema,
  listSubjectsQuerySchema,
};
