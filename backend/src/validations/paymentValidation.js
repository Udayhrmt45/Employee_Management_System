const Joi = require("joi");

exports.createOrderSchema = Joi.object({
  amount: Joi.number().integer().positive().required(),
  currency: Joi.string().length(3).optional(),
  plan: Joi.string().valid("FREE", "STARTER", "GROWTH").required()
});

exports.verifyPaymentSchema = Joi.object({
  razorpayOrderId: Joi.string().min(1).required(),
  razorpayPaymentId: Joi.string().min(1).required(),
  razorpaySignature: Joi.string().min(1).required(),
  plan: Joi.string().valid("FREE", "STARTER", "GROWTH").required()
});
