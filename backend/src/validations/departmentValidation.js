const Joi = require("joi");

const idSchema = Joi.number().integer().positive();

exports.departmentIdParamSchema = Joi.object({
  id: idSchema.required(),
});

exports.createDepartmentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
});

exports.updateDepartmentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
});

exports.deleteDepartmentSchema = Joi.object({
  reassignDepartmentId: idSchema.allow(null).optional(),
});
