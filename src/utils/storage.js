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

export const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

export const ensureBaseStorage = async () => {
  await Promise.all([ensureDir(getUploadsDir()), ensureDir(getHlsDir())]);
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

export const getRelativeUploadPath = (folderName, fileName) =>
  path.join("uploads", folderName, fileName);

export const getRelativeHlsPath = (folderName, fileName) =>
  path.join("hls", folderName, fileName);

export const toAbsolutePath = (relativePath) =>
  path.join(resolveStorageBase(), relativePath);

export default {
  ensureDir,
  ensureBaseStorage,
  ensureUploadFolder,
  ensureHlsFolder,
  getUploadsDir,
  getHlsDir,
  getRelativeUploadPath,
  getRelativeHlsPath,
  toAbsolutePath,
};
