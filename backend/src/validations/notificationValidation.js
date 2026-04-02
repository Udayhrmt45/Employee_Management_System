const Joi = require("joi");

const idSchema = Joi.number().integer().positive();

const notificationTargetTypes = [
  "ALL_USERS",
  "ALL_OWNERS",
  "COMPANY_ALL",
  "COMPANY_ADMINS",
  "SELECTED_OWNERS"
];

exports.createNotificationSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).required(),
  message: Joi.string().trim().min(3).max(5000).required(),
  targetType: Joi.string().valid(...notificationTargetTypes).required(),
  selectedOwnerIds: Joi.array().items(idSchema).unique().optional().default([])
});

exports.listNotificationSchema = Joi.object({
  limit: Joi.number().integer().positive().max(100).optional(),
  unreadOnly: Joi.boolean().optional()
});

exports.notificationIdParamSchema = Joi.object({
  id: idSchema.required()
});

exports.updateNotificationSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).optional(),
  message: Joi.string().trim().min(3).max(5000).optional(),
  targetType: Joi.string().valid(...notificationTargetTypes).optional(),
  selectedOwnerIds: Joi.array().items(idSchema).unique().optional()
}).or("title", "message", "targetType", "selectedOwnerIds");
