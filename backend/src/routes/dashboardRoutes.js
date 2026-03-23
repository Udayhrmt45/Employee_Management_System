const express = require("express");

const dashboardController = require("../controllers/dashboardController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const companyMiddleware = require("../middleware/companyMiddleware");

const router = express.Router();

router.use(authMiddleware, companyMiddleware);
router.get("/summary", asyncHandler(dashboardController.getDashboardData));

module.exports = router;
