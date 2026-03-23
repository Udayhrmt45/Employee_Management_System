const Joi = require("joi");

const idSchema = Joi.number().integer().positive();
const dateSchema = Joi.string().isoDate();

exports.applyLeaveSchema = Joi.object({
  leaveTypeId: idSchema.required(),
  startDate: dateSchema.required(),
  endDate: dateSchema.required(),
  reason: Joi.string().min(5).max(5000).required()
}).custom((value, helpers) => {
  if (value.endDate < value.startDate) {
    return helpers.error("any.invalid");
  }

  return value;
}, "leave date validation").messages({
  "any.invalid": "endDate must be on or after startDate"
});

exports.myLeaveSchema = Joi.object({
  page: idSchema.optional(),
  limit: Joi.number().integer().positive().max(100).optional(),
  status: Joi.string().valid("PENDING", "APPROVED", "REJECTED").optional()
});

exports.teamLeaveSchema = Joi.object({
  page: idSchema.optional(),
  limit: Joi.number().integer().positive().max(100).optional(),
  status: Joi.string().valid("PENDING", "APPROVED", "REJECTED").optional(),
  employeeId: idSchema.optional()
});

exports.leaveIdParamSchema = Joi.object({
  id: idSchema.required()
});

exports.leaveDecisionSchema = Joi.object({});
