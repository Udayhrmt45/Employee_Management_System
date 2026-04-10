const express = require("express");

const salaryController = require("../controllers/salaryController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const companyMiddleware = require("../middleware/companyMiddleware");

const router = express.Router();

router.use(authMiddleware, companyMiddleware);

// Salary Structure
router.post("/structure", asyncHandler(salaryController.setStructure));
router.get("/structure/:employeeId", asyncHandler(salaryController.getStructure));

// Salary Slips
router.post("/generate", asyncHandler(salaryController.generateSlip));
router.get("/slips", asyncHandler(salaryController.getSlips));
router.get("/slips/:id", asyncHandler(salaryController.getSlipById));
router.get("/slips/:id/pdf", asyncHandler(salaryController.downloadSlipPdf));

module.exports = router;
