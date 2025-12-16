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

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",
  port: Number.isNaN(port) ? 3000 : port,
  mongoUri: process.env.MONGO_URI ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
  storagePath: process.env.STORAGE_PATH ?? "",
  frontendOrigin: frontendOrigins[0],
  frontendOrigins,
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT || "20mb",
};

export default env;
