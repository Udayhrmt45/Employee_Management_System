const Joi = require("joi");

const idSchema = Joi.number().integer().positive();

exports.createHolidaySchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  date: Joi.string().isoDate().required(),
});

exports.listHolidaySchema = Joi.object({
  year: Joi.number().integer().min(2000).max(2100).required(),
});

exports.holidayIdParamSchema = Joi.object({
  id: idSchema.required(),
});
