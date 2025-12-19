import path from "path";
import { promises as fs } from "fs";

import env from "../config/env.js";

const resolveStorageBase = () => {
  if (!env.storagePath) {
    throw new Error("STORAGE_PATH environment variable is required");
  }

  return path.resolve(env.storagePath);
};

export const getUploadsDir = () => path.join(resolveStorageBase(), "uploads");

export const getHlsDir = () => path.join(resolveStorageBase(), "hls");

export const getThumbnailsDir = () =>
  path.join(resolveStorageBase(), "thumbnails");

export const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

export const ensureBaseStorage = async () => {
  await Promise.all([
    ensureDir(getUploadsDir()),
    ensureDir(getHlsDir()),
    ensureDir(getThumbnailsDir()),
  ]);
};

export const ensureUploadFolder = async (folderName) => {
  const uploadFolder = path.join(getUploadsDir(), folderName);
  await ensureDir(uploadFolder);
  return uploadFolder;
};

export const ensureHlsFolder = async (folderName) => {
  const hlsFolder = path.join(getHlsDir(), folderName);
  await ensureDir(hlsFolder);
  return hlsFolder;
};

export const ensureThumbnailsFolder = async (folderName) => {
  const thumbnailsFolder = path.join(getThumbnailsDir(), folderName);
  await ensureDir(thumbnailsFolder);
  return thumbnailsFolder;
};

const toPosix = (relativePath) => relativePath.replace(/\\/g, "/");

export const getRelativeUploadPath = (folderName, fileName) =>
  toPosix(path.join("uploads", folderName, fileName));

export const getRelativeHlsPath = (folderName, fileName = "") =>
  toPosix(path.join("hls", folderName, fileName));

export const getRelativeThumbnailPath = (folderName, fileName) =>
  toPosix(path.join("thumbnails", folderName, fileName));

export const toAbsolutePath = (relativePath) =>
  path.join(resolveStorageBase(), relativePath);

export default {
  ensureDir,
  ensureBaseStorage,
  ensureUploadFolder,
  ensureHlsFolder,
  ensureThumbnailsFolder,
  getUploadsDir,
  getHlsDir,
  getThumbnailsDir,
  getRelativeUploadPath,
  getRelativeHlsPath,
  getRelativeThumbnailPath,
  toAbsolutePath,
};
