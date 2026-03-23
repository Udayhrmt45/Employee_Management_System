const paymentService = require("../services/paymentService");
const ApiResponse = require("../utils/apiResponse");
const validateRequest = require("../utils/requestValidator");
const { createOrderSchema, verifyPaymentSchema } = require("../validations/paymentValidation");

exports.createOrder = async (req, res) => {
  const body = validateRequest(createOrderSchema, req.body);
  const order = await paymentService.createOrder(req.companyId, body);
  res.status(201).json(ApiResponse.success(order, "Payment order created"));
};

exports.verifyPayment = async (req, res) => {
  const body = validateRequest(verifyPaymentSchema, req.body);
  const payment = await paymentService.verifyPayment(req.companyId, body);
  res.status(200).json(ApiResponse.success(payment, "Payment verified successfully"));
};

exports.getSubscription = async (req, res) => {
  const subscription = await paymentService.getSubscription(req.companyId);
  res.status(200).json(ApiResponse.success(subscription, "Subscription fetched successfully"));
};
