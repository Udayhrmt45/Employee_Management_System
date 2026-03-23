const ApiResponse = require("../utils/apiResponse");

exports.health = async (req, res) => {
  res.status(200).json(
    ApiResponse.success(
      {
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      "Service healthy"
    )
  );
};
