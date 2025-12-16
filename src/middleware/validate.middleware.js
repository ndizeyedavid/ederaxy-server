import { ZodError } from "zod";

import ApiError from "../utils/apiError.js";

const SUPPORTED_SEGMENTS = ["body", "params", "query"];

export const validateRequest =
  (schema, segment = "body") =>
  (req, _res, next) => {
    try {
      if (!SUPPORTED_SEGMENTS.includes(segment)) {
        throw new Error(`Unsupported validation segment: ${segment}`);
      }

      const data = req[segment];
      const parsed = schema.parse(data);

      if (segment === "body") {
        req.body = parsed;
      } else if (segment === "params") {
        req.params = parsed;
      } else if (segment === "query") {
        req.query = parsed;
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(ApiError.fromZodError(error));
      }

      return next(error);
    }
  };

export default validateRequest;
