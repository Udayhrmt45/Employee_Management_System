const express = require("express");

const authController = require("../controllers/authController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const companyMiddleware = require("../middleware/companyMiddleware");

const router = express.Router();

router.post("/bootstrap", asyncHandler(authController.bootstrapWorkspace));
router.post("/invite", authMiddleware, companyMiddleware, asyncHandler(authController.inviteEmployees));
router.get("/me", authMiddleware, companyMiddleware, asyncHandler(authController.getCurrentUser));

module.exports = router;
