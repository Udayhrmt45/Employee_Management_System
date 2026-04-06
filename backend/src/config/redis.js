const Redis = require("ioredis");
const env = require("./env");
const logger = require("../utils/logger");

let redis = null;

/**
 * Create and connect the Redis singleton.
 * Safe to call multiple times — returns the existing client if already connected.
 */
async function connectRedis() {
  if (redis) {
    return redis;
  }

  redis = new Redis({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password || undefined,
    db: env.redis.db,
    lazyConnect: true,
    connectTimeout: 5000,
    maxRetriesPerRequest: 2,
    reconnectOnError(error) {
      // Reconnect on ECONNRESET and ECONNREFUSED transient errors
      const targetErrors = ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT"];
      return targetErrors.some((code) => error.message.includes(code));
    }
  });

  redis.on("error", (error) => {
    logger.error("Redis connection error", { message: error.message });
  });

  redis.on("reconnecting", () => {
    logger.warn("Redis reconnecting...");
  });

  redis.on("ready", () => {
    logger.info("Redis client ready");
  });

  await redis.connect();
  logger.info("Redis connected successfully", {
    host: env.redis.host,
    port: env.redis.port,
    db: env.redis.db
  });

  return redis;
}

/**
 * Return the active Redis client (or null if not connected).
 */
function getRedis() {
  return redis;
}

/**
 * Gracefully disconnect Redis. Call on process shutdown.
 */
async function disconnectRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info("Redis disconnected");
  }
}

module.exports = {
  connectRedis,
  getRedis,
  disconnectRedis
};
