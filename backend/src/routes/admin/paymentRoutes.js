const express = require("express");
const paymentController = require("../../controllers/admin/paymentController");
const asyncHandler = require("../../middleware/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(paymentController.getPayments));
router.get("/:companyId", asyncHandler(paymentController.getPaymentsByCompany));

module.exports = router;
