import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import env from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import ApiError from "./utils/apiError.js";

const app = express();

if (!env.isProduction) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.use((_req, res, next) => {
  res.setHeader("X-Powered-By", "Ederaxy");
  next();
});

app.disable("x-powered-by");

app.use(express.json({ limit: env.requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: env.requestBodyLimit }));
app.use(cookieParser());

app.use(
  cors({
    origin: env.frontendOrigins,
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "blob:"],
        "media-src": ["'self'", "data:", "blob:"],
      },
    },
  })
);

app.use("/api/v1/auth", authRoutes);

app.use((req, res, next) => {
  res.locals.startTime = process.hrtime.bigint();
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.statusCode || err.status || 500;

  if (!(err instanceof ApiError) && status >= 500) {
    console.error("Unexpected error", err);
  }

  res.status(status).json({
    status: "error",
    message: err.message || "Internal server error",
    errors: err.errors || undefined,
  });
});

export default app;
