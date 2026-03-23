const express = require("express");
const settingsController = require("../../controllers/admin/settingsController");
const asyncHandler = require("../../middleware/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(settingsController.getSettings));
router.put("/", asyncHandler(settingsController.updateSettings));

module.exports = router;
