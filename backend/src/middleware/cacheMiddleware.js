const { getCache, setCache, TTL } = require("../utils/cacheHelper");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

/**
 * Route-level Redis cache middleware factory.
 *
 * Usage:
 *   router.get("/employees", cacheRoute((req) => `hrms:employees:list:company:${req.companyId}`, TTL.EMPLOYEE), handler)
 *
 * @param {(req: Request) => string} keyBuilder  — function that builds the cache key from the request
 * @param {number} [ttlSeconds]                  — cache TTL in seconds (defaults to TTL.DEFAULT)
 * @returns Express middleware
 */
function cacheRoute(keyBuilder, ttlSeconds = TTL.DEFAULT) {
  return async (req, res, next) => {
    let key;

    try {
      key = keyBuilder(req);
    } catch (error) {
      // If key building fails (e.g. missing req.companyId), skip cache
      logger.warn("cacheMiddleware: failed to build cache key", { message: error.message });
      return next();
    }

    // Attempt cache lookup
    const cached = await getCache(key);

    if (cached !== null) {
      logger.debug("Cache HIT (middleware)", { key });
      return res.status(200).json(ApiResponse.success(cached, "Fetched from cache"));
    }

    logger.debug("Cache MISS (middleware)", { key });

    // Intercept res.json to capture the response body for caching
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300 && body?.success && body?.data !== undefined) {
        try {
          await setCache(key, body.data, ttlSeconds);
        } catch (cacheError) {
          logger.warn("cacheMiddleware: failed to write cache", { key, message: cacheError.message });
        }
      }

      return originalJson(body);
    };

    return next();
  };
}

module.exports = { cacheRoute };
