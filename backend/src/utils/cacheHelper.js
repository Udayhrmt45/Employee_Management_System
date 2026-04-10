const { getRedis } = require("../config/redis");
const logger = require("./logger");

// ─── TTL Constants (seconds) ─────────────────────────────────────────────────
const TTL = {
  EMPLOYEE: 600,       // 10 min  — employee list (changes infrequently)
  ATTENDANCE: 300,     // 5 min   — attendance records
  LEAVE: 300,          // 5 min   — leave requests
  LEAVE_TYPES: 600,    // 10 min  — leave types (near-static per company)
  DASHBOARD: 120,      // 2 min   — dashboard summary (high churn)
  DEPARTMENT: 600,     // 10 min  — department list (near-static)
  NOTIFICATIONS: 60,   // 1 min   — per-user notifications (real-time feel)
  SALARY: 300,         // 5 min   — salary structures & slips
  DEFAULT: 300         // 5 min   — fallback
};

// ─── Namespace Registry ───────────────────────────────────────────────────────
const CACHE_NAMESPACES = {
  DASHBOARD_SUMMARY:    "dashboard:summary",
  EMPLOYEE_LIST:        "employees:list",
  ATTENDANCE_DASHBOARD: "attendance:dashboard",
  ATTENDANCE_PERSONAL:  "attendance:personal",
  LEAVE_REQUESTS:       "leaves:requests",
  LEAVE_PERSONAL:       "leaves:personal",
  LEAVE_TYPES:          "leaves:types",
  HOLIDAYS:             "holidays:list",
  COMPANY_SUBSCRIPTION: "company:subscription",
  DEPARTMENT_LIST:      "departments:list",
  NOTIFICATIONS:        "notifications:user",
  SALARY_STRUCTURES:    "salary:structures",
  SALARY_SLIPS:         "salary:slips"
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getRedisClient() {
  return getRedis();
}

/**
 * Build a canonical, deterministic cache key.
 * Pattern: hrms:{namespace}:company:{companyId}:{sortedQueryJson}
 */
function buildCacheKey(namespace, companyId, query = {}) {
  const normalizedQuery = Object.keys(query)
    .sort()
    .reduce((acc, key) => {
      acc[key] = query[key];
      return acc;
    }, {});

  return `hrms:${namespace}:company:${companyId}:${JSON.stringify(normalizedQuery)}`;
}

/**
 * Build a per-user cache key (for notifications, personal records).
 * Pattern: hrms:{namespace}:user:{userId}:{sortedQueryJson}
 */
function buildUserCacheKey(namespace, userId, query = {}) {
  const normalizedQuery = Object.keys(query)
    .sort()
    .reduce((acc, key) => {
      acc[key] = query[key];
      return acc;
    }, {});

  return `hrms:${namespace}:user:${userId}:${JSON.stringify(normalizedQuery)}`;
}

// ─── Core Cache Primitives ────────────────────────────────────────────────────

/**
 * Get a raw JSON value from Redis.
 * Returns null if Redis is unavailable or key does not exist.
 */
async function getCache(key) {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    logger.warn("Redis getCache error", { key, message: error.message });
    return null;
  }
}

/**
 * Store a value in Redis as JSON with an explicit TTL.
 */
async function setCache(key, data, ttlSeconds = TTL.DEFAULT) {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch (error) {
    logger.warn("Redis setCache error", { key, message: error.message });
  }
}

/**
 * Delete a single key from Redis.
 */
async function deleteCache(key) {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    logger.warn("Redis deleteCache error", { key, message: error.message });
  }
}

// ─── Cache-Aside Pattern ─────────────────────────────────────────────────────

/**
 * Try to return a cached value; on MISS call resolver(), store result, and return it.
 * Logs HIT / MISS for observability.
 * Falls back to resolver() if Redis is unavailable.
 */
async function getOrSetJson(key, resolver, ttlSeconds = TTL.DEFAULT) {
  const redis = getRedisClient();

  if (!redis) {
    // Redis unavailable — bypass cache transparently
    return resolver();
  }

  try {
    const cachedValue = await redis.get(key);

    if (cachedValue !== null) {
      logger.debug("Cache HIT", { key });
      return JSON.parse(cachedValue);
    }
  } catch (error) {
    logger.warn("Redis read error — falling through to DB", { key, message: error.message });
    return resolver();
  }

  logger.debug("Cache MISS", { key });
  const freshValue = await resolver();

  try {
    await redis.set(key, JSON.stringify(freshValue), "EX", ttlSeconds);
  } catch (error) {
    logger.warn("Redis write error", { key, message: error.message });
  }

  return freshValue;
}

// ─── Namespace Invalidation ───────────────────────────────────────────────────

/**
 * Delete all keys matching a company-scoped namespace pattern using SCAN.
 * Pattern: hrms:{namespace}:company:{companyId}:*
 */
async function invalidateNamespace(namespace, companyId) {
  const redis = getRedisClient();
  if (!redis) return;

  const pattern = `hrms:${namespace}:company:${companyId}:*`;
  await _scanAndDelete(redis, pattern, namespace);
}

/**
 * Delete all keys matching a user-scoped namespace pattern using SCAN.
 * Pattern: hrms:{namespace}:user:{userId}:*
 */
async function invalidateUserNamespace(namespace, userId) {
  const redis = getRedisClient();
  if (!redis) return;

  const pattern = `hrms:${namespace}:user:${userId}:*`;
  await _scanAndDelete(redis, pattern, namespace);
}

async function _scanAndDelete(redis, pattern, label) {
  try {
    const stream = redis.scanStream({ match: pattern, count: 100 });
    const keys = [];

    await new Promise((resolve, reject) => {
      stream.on("data", (resultKeys) => keys.push(...resultKeys));
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    if (keys.length) {
      await redis.del(...keys);
      logger.debug("Cache invalidated", { pattern, keysDeleted: keys.length });
    }
  } catch (error) {
    logger.warn("Redis invalidation error", { pattern: label, message: error.message });
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  TTL,
  CACHE_NAMESPACES,
  buildCacheKey,
  buildUserCacheKey,
  getCache,
  setCache,
  deleteCache,
  getOrSetJson,
  invalidateNamespace,
  invalidateUserNamespace
};
