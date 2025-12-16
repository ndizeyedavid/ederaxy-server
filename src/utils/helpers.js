export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch((error) => {
    next(error);
  });

export const pick = (obj, keys = []) =>
  keys.reduce((acc, key) => {
    if (Object.hasOwn(obj, key) && obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});

export const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default {
  asyncHandler,
  pick,
  slugify,
};
