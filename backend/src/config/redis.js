const Redis = require("ioredis");
const env = require("./env");
const logger = require("../utils/logger");

let redis;

async function connectRedis() {
  if (redis) {
    return redis;
  }

  redis = new Redis({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
    db: env.redis.db,
    lazyConnect: true,
    maxRetriesPerRequest: 2
  });

  redis.on("error", (error) => {
    logger.error("Redis error", error);
  });

  await redis.connect();
  logger.info("Redis connected");
}

function getRedis() {
  return redis;
}

module.exports = {
  connectRedis,
  getRedis
};
