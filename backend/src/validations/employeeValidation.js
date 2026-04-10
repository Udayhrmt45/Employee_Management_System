const Joi = require("joi");

const idSchema = Joi.number().integer().positive();
const dateSchema = Joi.string().isoDate();

exports.createEmployeeSchema = Joi.object({
  userId: idSchema.optional(),
  employeeCode: Joi.string().max(50).optional(),
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().max(50).allow(null, "").optional(),
  departmentId: idSchema.optional(),
  designation: Joi.string().max(100).allow(null, "").optional(),
  joiningDate: Joi.date().iso().max("now").required(),
  paidLeaveBalance: Joi.number().integer().min(0).optional(),
  employmentType: Joi.string().valid("FULL_TIME", "PART_TIME", "CONTRACT").optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
  managerId: idSchema.allow(null).optional(),
  salary: Joi.object({
    basicSalary: Joi.number().min(0).precision(2).required(),
    hra: Joi.number().min(0).precision(2).required(),
    allowances: Joi.number().min(0).precision(2).required(),
    deductions: Joi.number().min(0).precision(2).required(),
    effectiveFrom: Joi.date().iso().optional()
  }).optional()
});

exports.updateEmployeeSchema = Joi.object({
  userId: idSchema.allow(null).optional(),
  employeeCode: Joi.string().max(50).allow(null, "").optional(),
  name: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().allow(null, "").optional(),
  phone: Joi.string().max(50).allow(null, "").optional(),
  departmentId: idSchema.allow(null).optional(),
  designation: Joi.string().max(100).allow(null, "").optional(),
  joiningDate: Joi.date().iso().max("now").allow(null).optional(),
  paidLeaveBalance: Joi.number().integer().min(0).allow(null).optional(),
  employmentType: Joi.string().valid("FULL_TIME", "PART_TIME", "CONTRACT").optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
  managerId: idSchema.allow(null).optional()
}).min(1);

exports.listEmployeeSchema = Joi.object({
  page: idSchema.optional(),
  limit: Joi.number().integer().positive().max(100).optional(),
  search: Joi.string().min(1).max(255).optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
  departmentId: idSchema.optional(),
  managerId: idSchema.allow(null).optional()
});

exports.employeeIdParamSchema = Joi.object({
  id: idSchema.required()
});
