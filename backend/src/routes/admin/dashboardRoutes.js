const express = require("express");
const dashboardController = require("../../controllers/admin/dashboardController");
const asyncHandler = require("../../middleware/asyncHandler");

const router = express.Router();

router.get("/stats", asyncHandler(dashboardController.getStats));

module.exports = router;
