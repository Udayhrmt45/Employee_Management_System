const express = require("express");

const holidayController = require("../controllers/holidayController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const companyMiddleware = require("../middleware/companyMiddleware");
const { requireAdminAccess } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, companyMiddleware);
router.get("/", asyncHandler(holidayController.listHolidays));
router.post("/", requireAdminAccess, asyncHandler(holidayController.createHoliday));
router.delete("/:id", requireAdminAccess, asyncHandler(holidayController.deleteHoliday));

module.exports = router;
