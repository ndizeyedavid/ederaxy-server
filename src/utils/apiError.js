export class ApiError extends Error {
  constructor(statusCode, message, errors = [], name = "ApiError") {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = name;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors, "BadRequestError");
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message, [], "UnauthorizedError");
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message, [], "ForbiddenError");
  }

  static notFound(message = "Not Found") {
    return new ApiError(404, message, [], "NotFoundError");
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message, [], "ConflictError");
  }

  static fromZodError(zodError, message = "Validation failed") {
    return ApiError.badRequest(message, zodError.errors ?? []);
  }
}

export default ApiError;
