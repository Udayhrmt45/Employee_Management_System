const Joi = require("joi");

exports.updateCompanySettingsSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  supportEmail: Joi.string().email().allow("", null).optional(),
  website: Joi.string().uri().allow("", null).optional(),
  phone: Joi.string().max(50).allow("", null).optional(),
});

exports.inviteMemberSchema = Joi.object({
  name: Joi.string().trim().max(255).allow("", null).optional(),
  email: Joi.string().email().required(),
  role: Joi.string().valid("ADMIN", "EMPLOYEE", "Admin", "Member", "Manager").required(),
});

exports.removeMemberSchema = Joi.object({
  memberId: Joi.alternatives().try(Joi.string().min(1), Joi.number().integer().positive()).required(),
  kind: Joi.string().valid("user", "invitation").required(),
});
