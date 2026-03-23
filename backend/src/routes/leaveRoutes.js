const express = require("express");

const leaveController = require("../controllers/leaveController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const companyMiddleware = require("../middleware/companyMiddleware");

const router = express.Router();

router.use(authMiddleware, companyMiddleware);
router.get("/types", asyncHandler(leaveController.getLeaveTypes));
router.get("/balance", asyncHandler(leaveController.getMyLeaveBalances));
router.post("/apply", asyncHandler(leaveController.applyLeave));
router.get("/my", asyncHandler(leaveController.getMyLeaves));
router.get("/team", asyncHandler(leaveController.getTeamLeaves));
router.put("/:id/approve", asyncHandler(leaveController.approveLeave));
router.put("/:id/reject", asyncHandler(leaveController.rejectLeave));

module.exports = router;
