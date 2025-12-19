import multer from "multer";

import ApiError from "../utils/apiError.js";

const THUMBNAIL_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const maxThumbnailFileSize = 10 * 1024 * 1024;

const fileFilter = (_req, file, cb) => {
  if (!THUMBNAIL_MIME_TYPES.includes(file.mimetype)) {
    cb(ApiError.badRequest("Unsupported thumbnail format"));
    return;
  }

  cb(null, true);
};

export const singleThumbnailUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxThumbnailFileSize,
  },
  fileFilter,
}).single("thumbnail");

export default {
  singleThumbnailUpload,
};
