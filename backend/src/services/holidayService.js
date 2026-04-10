const holidayRepository = require("../repositories/holidayRepository");
const ApiError = require("../utils/ApiError");
const cacheHelper = require("../utils/cacheHelper");
const { ensureLatestSchema } = require("./schemaBootstrapService");

const { CACHE_NAMESPACES, TTL } = cacheHelper;

exports.createHoliday = async (companyId, payload) => {
  await ensureLatestSchema();
  const existingHoliday = await holidayRepository.findByDate(companyId, payload.date);

  if (existingHoliday) {
    throw new ApiError(409, "A holiday already exists for this date");
  }

  const holiday = await holidayRepository.create(companyId, payload);
  await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.HOLIDAYS, companyId);
  return holiday;
};

exports.listHolidays = async (companyId, year) => {
  await ensureLatestSchema();
  const cacheKey = cacheHelper.buildCacheKey(CACHE_NAMESPACES.HOLIDAYS, companyId, { year });
  return cacheHelper.getOrSetJson(
    cacheKey,
    () => holidayRepository.listByYear(companyId, year),
    TTL.LEAVE_TYPES
  );
};

exports.deleteHoliday = async (companyId, id) => {
  await ensureLatestSchema();
  const deleted = await holidayRepository.remove(companyId, id);

  if (!deleted) {
    throw new ApiError(404, "Holiday not found");
  }

  await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.HOLIDAYS, companyId);
};
