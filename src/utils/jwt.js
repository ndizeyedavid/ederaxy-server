import jwt from "jsonwebtoken";

import env from "../config/env.js";

export const signToken = (payload, options = {}) =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtAccessExpiresIn,
    ...options,
  });

export const signRefreshToken = (payload, options = {}) =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
    ...options,
  });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export default {
  signToken,
  signRefreshToken,
  verifyToken,
};
