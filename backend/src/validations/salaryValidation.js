const Joi = require("joi");

const idSchema = Joi.number().integer().positive();
const moneySchema = Joi.number().min(0).precision(2);

exports.setSalaryStructureSchema = Joi.object({
  employeeId: idSchema.required(),
  basicSalary: moneySchema.required(),
  hra: moneySchema.required(),
  allowances: moneySchema.required(),
  deductions: moneySchema.required(),
  effectiveFrom: Joi.date().iso().optional()
});

exports.generateSlipSchema = Joi.object({
  employeeId: idSchema.required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required()
});

exports.slipIdParamSchema = Joi.object({
  id: idSchema.required()
});

exports.employeeIdParamSchema = Joi.object({
  employeeId: idSchema.required()
});

exports.slipsQuerySchema = Joi.object({
  employeeId: idSchema.optional(),
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2000).max(2100).optional(),
  page: idSchema.optional(),
  limit: Joi.number().integer().positive().max(100).optional()
});
