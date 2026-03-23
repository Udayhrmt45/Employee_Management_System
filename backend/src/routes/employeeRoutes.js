const express = require("express");

const employeeController = require("../controllers/employeeController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const companyMiddleware = require("../middleware/companyMiddleware");
const { requireManagerAccess, requireAdminAccess } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, companyMiddleware);
router.get("/", asyncHandler(employeeController.listEmployees));
router.get("/team", asyncHandler(employeeController.listTeamEmployees));
router.get("/departments", asyncHandler(employeeController.listDepartments));
router.get("/:id/leave-balances", asyncHandler(employeeController.getEmployeeLeaveBalances));
router.get("/:id", asyncHandler(employeeController.getEmployeeById));
router.post("/", requireAdminAccess, asyncHandler(employeeController.createEmployee));
router.put("/:id", requireManagerAccess, asyncHandler(employeeController.updateEmployee));
router.delete("/:id", requireAdminAccess, asyncHandler(employeeController.deleteEmployee));

module.exports = router;
