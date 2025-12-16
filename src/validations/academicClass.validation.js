import { z } from "zod";

import { OBJECT_ID_REGEX } from "../utils/constants.js";

const nameSchema = z
  .string({ required_error: "Name is required" })
  .min(1, "Name must be at least 1 character long")
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

export const createAcademicClassSchema = z.object({
  name: nameSchema,
  code: z
    .string({ required_error: "Code is required" })
    .min(1, "Code must be at least 1 character long")
    .max(10, "Code must be at most 10 characters long")
    .transform((value) => value.trim().toUpperCase()),
  description: descriptionSchema,
  levelId: z
    .string({ required_error: "Academic level ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid academic level identifier"),
  order: orderSchema,
  combinationIds: z
    .array(z.string().regex(OBJECT_ID_REGEX, "Invalid combination identifier"))
    .optional()
    .transform((value) => value ?? []),
});

export const updateAcademicClassSchema = createAcademicClassSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
  );

export const academicClassIdParamSchema = z.object({
  classId: z
    .string({ required_error: "Class ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid academic class identifier"),
});

export const listAcademicClassesQuerySchema = z.object({
  levelId: z
    .string()
    .regex(OBJECT_ID_REGEX, "Invalid academic level identifier")
    .optional(),
  includeCombinations: z.coerce.boolean().optional(),
});

export const academicClassDetailQuerySchema = z.object({
  includeCombinations: z.coerce.boolean().optional(),
});

export default {
  createAcademicClassSchema,
  updateAcademicClassSchema,
  academicClassIdParamSchema,
  listAcademicClassesQuerySchema,
  academicClassDetailQuerySchema,
};
