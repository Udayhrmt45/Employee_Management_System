const express = require("express");

const notificationController = require("../controllers/notificationController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const companyMiddleware = require("../middleware/companyMiddleware");

const router = express.Router();

router.use(authMiddleware, companyMiddleware);

router.post("/", asyncHandler(notificationController.createNotification));
router.get("/", asyncHandler(notificationController.getNotifications));
router.put("/:id/read", asyncHandler(notificationController.markNotificationRead));
router.put("/:id", asyncHandler(notificationController.updateNotification));
router.delete("/:id", asyncHandler(notificationController.deleteNotification));

module.exports = router;
