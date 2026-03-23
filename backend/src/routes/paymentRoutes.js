const express = require("express");

const paymentController = require("../controllers/paymentController");
const asyncHandler = require("../middleware/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const companyMiddleware = require("../middleware/companyMiddleware");
const { requireOwnerOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, companyMiddleware, requireOwnerOnly);
router.post("/create-order", asyncHandler(paymentController.createOrder));
router.post("/verify", asyncHandler(paymentController.verifyPayment));
router.get("/subscription", asyncHandler(paymentController.getSubscription));

module.exports = router;
