import { z } from "zod";

import { EDUCATION_STAGES, OBJECT_ID_REGEX } from "../utils/constants.js";

const nameSchema = z
  .string({ required_error: "Name is required" })
  .min(3, "Name must be at least 3 characters long")
  .max(150, "Name must be at most 150 characters long")
  .transform((value) => value.trim());

const descriptionSchema = z
  .string()
  .max(2000, "Description must be at most 2000 characters long")
  .transform((value) => value.trim())
  .optional()
  .or(z.literal("").transform(() => ""));

const orderSchema = z
  .number()
  .int("Order must be an integer")
  .min(0, "Order must be zero or positive")
  .optional();

export const createAcademicLevelSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  stage: z.nativeEnum(EDUCATION_STAGES, {
    required_error: "Stage is required",
  }),
  curriculumId: z
    .string({ required_error: "Curriculum ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid curriculum identifier"),
  order: orderSchema,
});

export const updateAcademicLevelSchema = createAcademicLevelSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
  );

export const academicLevelIdParamSchema = z.object({
  levelId: z
    .string({ required_error: "Level ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid academic level identifier"),
});

export const listAcademicLevelsQuerySchema = z.object({
  curriculumId: z
    .string()
    .regex(OBJECT_ID_REGEX, "Invalid curriculum identifier")
    .optional(),
  includeClasses: z.coerce.boolean().optional(),
});

export const academicLevelDetailQuerySchema = z.object({
  includeClasses: z.coerce.boolean().optional(),
});

export default {
  createAcademicLevelSchema,
  updateAcademicLevelSchema,
  academicLevelIdParamSchema,
  listAcademicLevelsQuerySchema,
  academicLevelDetailQuerySchema,
};
