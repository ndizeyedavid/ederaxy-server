import fs from "fs";
import path from "path";

import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import ApiError from "../utils/apiError.js";
import env from "../config/env.js";
import { VIDEO_MIME_TYPES } from "../utils/constants.js";
import { getUploadsDir } from "../utils/storage.js";

const maxFileSize = env.videoUploadMaxFileSize ?? 500 * 1024 * 1024;

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    try {
      const uploadsBase = getUploadsDir();
      fs.mkdirSync(uploadsBase, { recursive: true });

      const folderName = uuidv4();
      const folderPath = path.join(uploadsBase, folderName);
      fs.mkdirSync(folderPath, { recursive: true });

      req.videoUploadContext = {
        folderName,
      };

      cb(null, folderPath);
    } catch (error) {
      cb(error instanceof Error ? error : new Error("Upload setup failed"));
    }
  },
  filename(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase() || ".mp4";
    const storedFileName = `original${extension}`;

    if (req.videoUploadContext) {
      req.videoUploadContext.fileName = storedFileName;
    }

    cb(null, storedFileName);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!VIDEO_MIME_TYPES.includes(file.mimetype)) {
    cb(ApiError.badRequest("Unsupported video format"));
    return;
  }

  cb(null, true);
};

export const singleVideoUpload = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter,
}).single("video");

export default {
  singleVideoUpload,
};
