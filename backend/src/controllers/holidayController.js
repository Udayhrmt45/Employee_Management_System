const holidayService = require("../services/holidayService");
const ApiResponse = require("../utils/apiResponse");
const validateRequest = require("../utils/requestValidator");
const {
  createHolidaySchema,
  holidayIdParamSchema,
  listHolidaySchema,
} = require("../validations/holidayValidation");

exports.createHoliday = async (req, res) => {
  const body = validateRequest(createHolidaySchema, req.body);
  const holiday = await holidayService.createHoliday(req.companyId, body);
  res.status(201).json(ApiResponse.success(holiday, "Holiday created successfully"));
};

exports.listHolidays = async (req, res) => {
  const query = validateRequest(listHolidaySchema, req.query);
  const holidays = await holidayService.listHolidays(req.companyId, query.year);
  res.status(200).json(ApiResponse.success(holidays, "Holidays fetched successfully"));
};

exports.deleteHoliday = async (req, res) => {
  const params = validateRequest(holidayIdParamSchema, req.params);
  await holidayService.deleteHoliday(req.companyId, params.id);
  res.status(200).json(ApiResponse.success(null, "Holiday deleted successfully"));
};
