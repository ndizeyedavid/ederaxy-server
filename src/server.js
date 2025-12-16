import app from "./app.js";
import { env } from "./config/env.js";
import connectDatabase, { disconnectDatabase } from "./config/db.js";

let server;

const startServer = async () => {
  try {
    await connectDatabase();

    server = app.listen(env.port, () => {
      console.log(`Ederaxy server is running on port ${env.port}`);
    });

    server.on("error", (error) => {
      console.error("Failed to start server", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Startup failure", error);
    process.exit(1);
  }
};

startServer();

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          console.log("HTTP server closed.");
          resolve();
        });
      });
    }

    await disconnectDatabase();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown", error);
    process.exit(1);
  }

  setTimeout(() => {
    console.warn("Forcing shutdown after timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
