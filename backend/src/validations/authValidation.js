const Joi = require("joi");

exports.bootstrapWorkspaceSchema = Joi.object({
  companyName: Joi.string().min(2).max(255).required(),
  companySize: Joi.string().max(50).allow("", null).optional(),
  industry: Joi.string().max(100).allow("", null).optional(),
  departments: Joi.array().items(Joi.string().trim().min(1).max(255)).default([])
});

const onboardingInviteSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).allow("", null).optional(),
  email: Joi.string().email().required(),
  role: Joi.string().trim().max(100).allow("", null).optional()
});

exports.inviteEmployeesSchema = Joi.object({
  employees: Joi.array().items(onboardingInviteSchema).max(100).required()
});
