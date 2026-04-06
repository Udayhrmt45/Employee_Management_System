const dashboardRepository = require("../repositories/dashboardRepository");
const cacheHelper = require("../utils/cacheHelper");

const { CACHE_NAMESPACES, TTL } = cacheHelper;

exports.getDashboardData = async (companyId) => {
  const cacheKey = cacheHelper.buildCacheKey(CACHE_NAMESPACES.DASHBOARD_SUMMARY, companyId);

  return cacheHelper.getOrSetJson(
    cacheKey,
    async () => {
      const [summary, recentActivity] = await Promise.all([
        dashboardRepository.getSummary(companyId),
        dashboardRepository.getRecentActivity(companyId),
      ]);

      return {
        summary,
        recentActivity,
      };
    },
    TTL.DASHBOARD
  );
};
