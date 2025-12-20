import multer from "multer";

import ApiError from "../utils/apiError.js";

const PROFILE_PICTURE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const maxProfilePictureSize = 10 * 1024 * 1024;

const fileFilter = (_req, file, cb) => {
  if (!PROFILE_PICTURE_MIME_TYPES.includes(file.mimetype)) {
    cb(ApiError.badRequest("Unsupported profile picture format"));
    return;
  }

  cb(null, true);
};

export const singleProfilePictureUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxProfilePictureSize,
  },
  fileFilter,
}).single("profilePicture");

export default {
  singleProfilePictureUpload,
};
