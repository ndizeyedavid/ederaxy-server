import { z } from "zod";

import {
  CLASS_COMBINATION_TYPES,
  OBJECT_ID_REGEX,
} from "../utils/constants.js";

const nameSchema = z
  .string({ required_error: "Name is required" })
  .min(2, "Name must be at least 2 characters long")
  .max(150, "Name must be at most 150 characters long")
  .transform((value) => value.trim());

const descriptionSchema = z
  .string()
  .max(2000, "Description must be at most 2000 characters long")
  .transform((value) => value.trim())
  .optional()
  .or(z.literal("").transform(() => ""));

export const createClassCombinationSchema = z.object({
  name: nameSchema,
  code: z
    .string({ required_error: "Code is required" })
    .min(2, "Code must be at least 2 characters long")
    .max(10, "Code must be at most 10 characters long")
    .transform((value) => value.trim().toUpperCase()),
  description: descriptionSchema,
  type: z
    .nativeEnum(CLASS_COMBINATION_TYPES)
    .default(CLASS_COMBINATION_TYPES.GENERAL),
  subjects: z
    .array(z.string().regex(OBJECT_ID_REGEX, "Invalid subject identifier"))
    .optional()
    .transform((value) => value ?? []),
});

export const updateClassCombinationSchema = createClassCombinationSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
  );

export const classCombinationIdParamSchema = z.object({
  combinationId: z
    .string({ required_error: "Combination ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid class combination identifier"),
});

export const listClassCombinationsQuerySchema = z.object({
  type: z.nativeEnum(CLASS_COMBINATION_TYPES).optional(),
  includeSubjects: z.coerce.boolean().optional(),
});

export const classCombinationDetailQuerySchema = z.object({
  includeSubjects: z.coerce.boolean().optional(),
});

export default {
  createClassCombinationSchema,
  updateClassCombinationSchema,
  classCombinationIdParamSchema,
  listClassCombinationsQuerySchema,
  classCombinationDetailQuerySchema,
};
