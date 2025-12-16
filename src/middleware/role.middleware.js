import ApiError from "../utils/apiError.js";
import { USER_ROLES } from "../utils/constants.js";

export const requireRole =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden("You do not have permission to perform this action")
      );
    }

    return next();
  };

export const ensureTeacher = requireRole(USER_ROLES.TEACHER);
export const ensureStudent = requireRole(USER_ROLES.STUDENT);

export default {
  requireRole,
  ensureTeacher,
  ensureStudent,
};
