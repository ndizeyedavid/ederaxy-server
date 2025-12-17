import { z } from "zod";

import { OBJECT_ID_REGEX } from "../utils/constants.js";

export const lessonVideoParamsSchema = z.object({
  lessonId: z
    .string({ required_error: "Lesson ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid lesson identifier"),
});

export const videoIdParamSchema = z.object({
  videoId: z
    .string({ required_error: "Video ID is required" })
    .regex(OBJECT_ID_REGEX, "Invalid video identifier"),
});

export default {
  lessonVideoParamsSchema,
  videoIdParamSchema,
};
