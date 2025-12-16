import mongoose from "mongoose";

import env from "./env.js";

const options = {
  dbName: env.mongoDbName,
  autoIndex: env.nodeEnv !== "production",
  maxPoolSize: 10,
};

export const connectDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is not defined.");
  }

  try {
    await mongoose.connect(env.mongoUri, options);
    console.log(
      `Connected to MongoDB${options.dbName ? ` (${options.dbName})` : ""}`
    );
  } catch (error) {
    console.error("MongoDB connection error", error);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};

export default connectDatabase;
