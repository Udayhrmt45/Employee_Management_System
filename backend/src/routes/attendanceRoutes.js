const express = require("express");

const attendanceController = require("../controllers/attendanceController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const companyMiddleware = require("../middleware/companyMiddleware");

const router = express.Router();

router.use(authMiddleware, companyMiddleware);
router.post("/checkin", asyncHandler(attendanceController.checkIn));
router.post("/checkout", asyncHandler(attendanceController.checkOut));
router.get("/me", asyncHandler(attendanceController.getMyAttendance));
router.get("/export", asyncHandler(attendanceController.exportTeamAttendance));
router.get("/team", asyncHandler(attendanceController.getTeamAttendance));

module.exports = router;
