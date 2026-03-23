const Joi = require("joi");

const idSchema = Joi.number().integer().positive();
const dateSchema = Joi.string().isoDate();
const isoDateTimeSchema = Joi.string().isoDate();

exports.checkInSchema = Joi.object({
  date: dateSchema.optional(),
  checkIn: isoDateTimeSchema.optional(),
  status: Joi.string().valid("PRESENT", "ABSENT", "HALF_DAY").optional()
});

exports.checkOutSchema = Joi.object({
  date: dateSchema.optional(),
  checkOut: isoDateTimeSchema.optional()
});

exports.myAttendanceSchema = Joi.object({
  page: idSchema.optional(),
  limit: Joi.number().integer().positive().max(100).optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional()
});

exports.teamAttendanceSchema = Joi.object({
  page: idSchema.optional(),
  limit: Joi.number().integer().positive().max(100).optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  employeeId: idSchema.optional(),
  status: Joi.string().valid("PRESENT", "ABSENT", "HALF_DAY", "LATE").optional()
});
