import { ZodError } from "zod";

import ApiError from "../utils/apiError.js";

export const validateRequest = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return next(ApiError.fromZodError(error));
    }

    return next(error);
  }
};

export default validateRequest;
