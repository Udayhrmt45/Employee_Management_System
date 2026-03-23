const dashboardRepository = require("../../repositories/admin/dashboardRepository");

exports.getPlatformStats = async () => {
  return await dashboardRepository.getGlobalStats();
};
