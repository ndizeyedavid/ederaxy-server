import Redis from "ioredis";

import { env } from "./env.js";

const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

let sharedConnection;

export const createRedisConnection = () =>
  new Redis(env.redisUrl, redisOptions);

export const getRedisConnection = () => {
  if (!sharedConnection) {
    sharedConnection = createRedisConnection();
  }

  return sharedConnection;
};

export default {
  createRedisConnection,
  getRedisConnection,
};
