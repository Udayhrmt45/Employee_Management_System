const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const healthController = require("../controllers/healthController");

const router = express.Router();

router.get("/", asyncHandler(healthController.health));

module.exports = router;
