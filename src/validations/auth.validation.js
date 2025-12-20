import { z } from "zod";

import { USER_ROLES } from "../utils/constants.js";

const ROLE_VALUES = [USER_ROLES.STUDENT, USER_ROLES.TEACHER];
const roleEnum = z.enum(ROLE_VALUES);

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters long")
      .transform((value) => value.trim()),
    email: z
      .email("Provide a valid email address")
      .transform((value) => value.toLowerCase().trim()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password must be at most 100 characters"),
    role: roleEnum.default(USER_ROLES.STUDENT),
    dob: z.coerce.date().optional(),
    nationalId: z
      .string()
      .min(12, "National ID must be at least 5 characters long")
      .optional(),
    profilePicture: z.url().optional(),
    bio: z.string().max(500).optional(),
    phone: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    teacherTitle: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    yearsExperience: z.coerce.number().int().min(0).optional(),
    highestQualification: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    subjects: z.array(z.string().transform((value) => value.trim())).optional(),
    schoolName: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    schoolType: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    country: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    city: z
      .string()
      .transform((value) => value.trim())
      .optional(),
    preferredCurriculumId: z.string().optional(),
    agreeToTerms: z.boolean().optional(),
    termsVersion: z
      .string()
      .transform((value) => value.trim())
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === USER_ROLES.TEACHER && !data.nationalId) {
      ctx.addIssue({
        code: "custom",
        path: ["nationalId"],
        message: "Teachers must provide a national ID",
      });
    }
  });

export const loginSchema = z.object({
  email: z
    .string()
    .email("Provide a valid email address")
    .transform((value) => value.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be at most 100 characters"),
});

export default {
  registerSchema,
  loginSchema,
};
