import dotenv from "dotenv";

const envFile =
  process.env.NODE_ENV === "test" ? ".env.test" : process.env.ENV_FILE_PATH;

dotenv.config(
  envFile
    ? {
        path: envFile,
      }
    : undefined
);

const requiredVariables = [
  "MONGO_URI",
  "JWT_SECRET",
  "REDIS_URL",
  "STORAGE_PATH",
];

const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable]
);

if (missingVariables.length && process.env.NODE_ENV !== "test") {
  throw new Error(
    `Missing required environment variables: ${missingVariables.join(", ")}`
  );
}

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
const rawFrontendOrigins =
  process.env.FRONTEND_ORIGINS ||
  process.env.FRONTEND_ORIGIN ||
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  "http://localhost:3000";

const frontendOrigins = rawFrontendOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const bcryptSaltRoundsRaw = process.env.BCRYPT_SALT_ROUNDS
  ? Number.parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
  : 10;

const bcryptSaltRounds = Number.isNaN(bcryptSaltRoundsRaw)
  ? 10
  : bcryptSaltRoundsRaw;

const jwtAccessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "1h";
const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const authRateLimitWindowMs = process.env.AUTH_RATE_LIMIT_WINDOW_MS
  ? Number.parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10)
  : 15 * 60 * 1000;
const authRateLimitMax = process.env.AUTH_RATE_LIMIT_MAX
  ? Number.parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10)
  : 100;

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",
  port: Number.isNaN(port) ? 3000 : port,
  mongoUri: process.env.MONGO_URI ?? "",
  mongoDbName: process.env.MONGO_DB_NAME || "ederaxy",
  jwtSecret: process.env.JWT_SECRET ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
  storagePath: process.env.STORAGE_PATH ?? "",
  videoUploadMaxFileSize: process.env.VIDEO_UPLOAD_MAX_FILE_SIZE
    ? Number.parseInt(process.env.VIDEO_UPLOAD_MAX_FILE_SIZE, 10)
    : undefined,
  videoProcessingConcurrency: Number.parseInt(
    process.env.VIDEO_PROCESSING_CONCURRENCY ?? "2",
    10
  ),
  frontendOrigin: frontendOrigins[0],
  frontendOrigins,
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT || "20mb",
  bcryptSaltRounds,
  jwtAccessExpiresIn,
  jwtRefreshExpiresIn,
  authRateLimitWindowMs,
  authRateLimitMax,
};

export default env;
