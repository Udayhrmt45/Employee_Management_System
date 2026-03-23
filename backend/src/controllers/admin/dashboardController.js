const dashboardService = require("../../services/admin/dashboardService");

exports.getStats = async (req, res) => {
  const stats = await dashboardService.getPlatformStats();
  res.status(200).json({ success: true, data: stats });
};
