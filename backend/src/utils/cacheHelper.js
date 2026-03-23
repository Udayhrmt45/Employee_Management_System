const { getRedis } = require("../config/redis");

const DEFAULT_TTL_SECONDS = 300;
const CACHE_NAMESPACES = {
  DASHBOARD_SUMMARY: "dashboard:summary",
  EMPLOYEE_LIST: "employees:list",
  ATTENDANCE_DASHBOARD: "attendance:dashboard",
  LEAVE_REQUESTS: "leaves:requests",
  COMPANY_SUBSCRIPTION: "company:subscription"
};

function getRedisClient() {
  return getRedis();
}

function buildCacheKey(namespace, companyId, query = {}) {
  const normalizedQuery = Object.keys(query)
    .sort()
    .reduce((accumulator, key) => {
      accumulator[key] = query[key];
      return accumulator;
    }, {});

  return `hrms:${namespace}:company:${companyId}:${JSON.stringify(normalizedQuery)}`;
}

async function getOrSetJson(key, resolver, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const redis = getRedisClient();

  if (!redis) {
    return resolver();
  }

  const cachedValue = await redis.get(key);

  if (cachedValue) {
    return JSON.parse(cachedValue);
  }

  const freshValue = await resolver();
  await redis.set(key, JSON.stringify(freshValue), "EX", ttlSeconds);
  return freshValue;
}

async function invalidateNamespace(namespace, companyId) {
  const redis = getRedisClient();

  if (!redis) {
    return;
  }

  const pattern = `hrms:${namespace}:company:${companyId}:*`;
  const stream = redis.scanStream({ match: pattern, count: 100 });
  const keys = [];

  await new Promise((resolve, reject) => {
    stream.on("data", (resultKeys) => {
      keys.push(...resultKeys);
    });
    stream.on("end", resolve);
    stream.on("error", reject);
  });

  if (keys.length) {
    await redis.del(...keys);
  }
}

module.exports = {
  CACHE_NAMESPACES,
  buildCacheKey,
  getOrSetJson,
  invalidateNamespace
};
