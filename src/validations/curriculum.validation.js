import { z } from "zod";

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

export const createCurriculumSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  country: z
    .string()
    .min(2, "Country must be at least 2 characters long")
    .max(100, "Country must be at most 100 characters long")
    .transform((value) => value.trim())
    .optional(),
});

export const updateCurriculumSchema = createCurriculumSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
  );

export const curriculumIdParamSchema = z.object({
  curriculumId: z
    .string({ required_error: "Curriculum ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid curriculum identifier"),
});

export const listCurriculumsQuerySchema = z.object({
  includeHierarchy: z.coerce.boolean().optional(),
});

export const curriculumDetailQuerySchema = z.object({
  includeHierarchy: z.coerce.boolean().optional(),
});

export default {
  createCurriculumSchema,
  updateCurriculumSchema,
  curriculumIdParamSchema,
  listCurriculumsQuerySchema,
  curriculumDetailQuerySchema,
};
