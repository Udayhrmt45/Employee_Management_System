const dashboardService = require("../services/dashboardService");
const ApiResponse = require("../utils/apiResponse");

exports.getDashboardData = async (req, res) => {
  const dashboard = await dashboardService.getDashboardData(req.companyId);

  res
    .status(200)
    .json(ApiResponse.success(dashboard, "Dashboard data fetched successfully"));
};
