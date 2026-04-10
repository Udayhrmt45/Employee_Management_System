const express = require("express");

const authRoutes = require("./authRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const healthRoutes = require("./healthRoutes");
const employeeRoutes = require("./employeeRoutes");
const attendanceRoutes = require("./attendanceRoutes");
const leaveRoutes = require("./leaveRoutes");
const holidayRoutes = require("./holidayRoutes");
const paymentRoutes = require("./paymentRoutes");
const settingsRoutes = require("./settingsRoutes");
const departmentRoutes = require("./departmentRoutes");
const notificationRoutes = require("./notificationRoutes");
const demoRoutes = require("./demoRoutes");
const salaryRoutes = require("./salaryRoutes");

const authMiddleware = require("../middleware/authMiddleware");
const { requireSuperAdmin } = require("../middleware/roleMiddleware");

const adminCompanyRoutes = require("./admin/companyRoutes");
const adminPaymentRoutes = require("./admin/paymentRoutes");
const adminSettingsRoutes = require("./admin/settingsRoutes");
const adminDashboardRoutes = require("./admin/dashboardRoutes");
const adminDemoRoutes = require("./admin/demoRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/health", healthRoutes);
router.use("/employees", employeeRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/leaves", leaveRoutes);
router.use("/holidays", holidayRoutes);
router.use("/payments", paymentRoutes);
router.use("/settings", settingsRoutes);
router.use("/departments", departmentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/demo-requests", demoRoutes);
router.use("/salary", salaryRoutes);

// Super Admin Routes
router.use("/admin/dashboard", authMiddleware, requireSuperAdmin, adminDashboardRoutes);
router.use("/admin/companies", authMiddleware, requireSuperAdmin, adminCompanyRoutes);
router.use("/admin/payments", authMiddleware, requireSuperAdmin, adminPaymentRoutes);
router.use("/admin/settings", authMiddleware, requireSuperAdmin, adminSettingsRoutes);
router.use("/admin/demo-requests", authMiddleware, requireSuperAdmin, adminDemoRoutes);

module.exports = router;
