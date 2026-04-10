const salaryRepository = require("../repositories/salaryRepository");
const employeeRepository = require("../repositories/employeeRepository");
const holidayRepository = require("../repositories/holidayRepository");
const ApiError = require("../utils/ApiError");
const cacheHelper = require("../utils/cacheHelper");
const { CACHE_NAMESPACES, TTL } = cacheHelper;
const { hasPermission, ROLES } = require("../utils/roleHierarchy");
const { enumerateDateKeys, formatDateKey, getMonthBounds, normalizeToUtcDate } = require("../utils/dateUtils");

function assertAdminOrOwner(user) {
  if (!hasPermission(user.role, ROLES.ADMIN)) {
    throw new ApiError(403, "Only ADMIN or OWNER can perform this action");
  }
}

async function getEmployeeRecord(companyId, employeeId) {
  const employee = await employeeRepository.findById(companyId, employeeId);
  if (!employee) {
    throw new ApiError(404, `Employee #${employeeId} not found in this company`);
  }
  return employee;
}

async function getEmployeeByUserId(companyId, userId) {
  const { getDatabase } = require("../config/database");
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT id, company_id, user_id, name, status
     FROM employees
     WHERE company_id = $1 AND user_id = $2
     LIMIT 1`,
    [companyId, userId]
  );

  if (!rows[0]) {
    throw new ApiError(404, "Employee profile not found for the authenticated user");
  }

  return rows[0];
}

function ensureEligiblePeriod(employee, year, month) {
  if (!employee.joiningDate) {
    return;
  }

  const joiningDate = normalizeToUtcDate(employee.joiningDate);
  const joiningYear = joiningDate.getUTCFullYear();
  const joiningMonth = joiningDate.getUTCMonth() + 1;

  if (year < joiningYear || (year === joiningYear && month < joiningMonth)) {
    throw new ApiError(400, "Cannot generate salary slip for a period before the employee's joining date.");
  }
}

async function buildWorkingDaySummary(companyId, employee, year, month) {
  const totalDays = new Date(year, month, 0).getDate();
  const monthBounds = getMonthBounds(year, month);
  const monthStartKey = formatDateKey(monthBounds.start);
  const monthEndKey = formatDateKey(monthBounds.end);
  const fullMonthCalendarDays = enumerateDateKeys(monthStartKey, monthEndKey);

  let activeStartKey = monthStartKey;
  if (employee.joiningDate) {
    const joiningDateKey = formatDateKey(employee.joiningDate);
    if (joiningDateKey > activeStartKey) {
      activeStartKey = joiningDateKey;
    }
  }

  const activeCalendarDays = enumerateDateKeys(activeStartKey, monthEndKey);
  const holidays = await holidayRepository.listBetween(companyId, monthStartKey, monthEndKey);
  const allHolidayKeys = holidays.map((holiday) => formatDateKey(holiday.date));
  const activeHolidayKeys = allHolidayKeys.filter((dateKey) => dateKey >= activeStartKey);

  return {
    totalDays,
    monthStartKey,
    monthEndKey,
    activeStartKey,
    holidayCount: activeHolidayKeys.length,
    fullMonthWorkingDays: Math.max(fullMonthCalendarDays.length - allHolidayKeys.length, 0),
    workingDays: Math.max(activeCalendarDays.length - activeHolidayKeys.length, 0),
  };
}

async function splitLeaveDaysForMonth(companyId, leave, monthStartKey, monthEndKey, activeStartKey) {
  const leaveHolidaySet = new Set(
    (await holidayRepository.listBetween(companyId, formatDateKey(leave.start_date), formatDateKey(leave.end_date)))
      .map((holiday) => formatDateKey(holiday.date))
  );

  const allEffectiveDates = enumerateDateKeys(leave.start_date, leave.end_date).filter((dateKey) => {
    if (dateKey < activeStartKey) {
      return false;
    }

    return !leaveHolidaySet.has(dateKey);
  });

  const paidLimit = Number(leave.paid_days || 0);
  let paidLeaveDays = 0;
  let lopDays = 0;

  allEffectiveDates.forEach((dateKey, index) => {
    if (dateKey < monthStartKey || dateKey > monthEndKey) {
      return;
    }

    if (index < paidLimit) {
      paidLeaveDays += 1;
    } else {
      lopDays += 1;
    }
  });

  return { paidLeaveDays, lopDays };
}

async function calculateSlipMetrics(companyId, employee, year, month) {
  const workingSummary = await buildWorkingDaySummary(companyId, employee, year, month);
  const approvedLeaves = await salaryRepository.getApprovedLeavesForMonth(companyId, employee.id, year, month);

  let paidLeaveDays = 0;
  let lopDays = 0;

  for (const leave of approvedLeaves) {
    const split = await splitLeaveDaysForMonth(
      companyId,
      leave,
      workingSummary.monthStartKey,
      workingSummary.monthEndKey,
      workingSummary.activeStartKey
    );

    paidLeaveDays += split.paidLeaveDays;
    lopDays += split.lopDays;
  }

  const payableDays = Math.max(0, workingSummary.workingDays - lopDays);

  return {
    totalDays: workingSummary.totalDays,
    fullMonthWorkingDays: workingSummary.fullMonthWorkingDays,
    workingDays: workingSummary.workingDays,
    holidayCount: workingSummary.holidayCount,
    paidLeaveDays,
    lopDays,
    payableDays,
  };
}

async function createSlipForPeriod(companyId, employee, structure, { month, year, generatedBy }, options = {}) {
  ensureEligiblePeriod(employee, year, month);

  const existingSlip = await salaryRepository.findSlipByPeriod(companyId, employee.id, month, year);
  if (existingSlip && !options.allowExisting) {
    throw new ApiError(409, "Salary slip already exists for this employee and pay period");
  }

  const metrics = await calculateSlipMetrics(companyId, employee, year, month);
  const prorateRatio = metrics.fullMonthWorkingDays > 0
    ? metrics.payableDays / metrics.fullMonthWorkingDays
    : 0;

  const proratedBasic = Number(structure.basicSalary) * prorateRatio;
  const proratedHra = Number(structure.hra) * prorateRatio;
  const proratedAllowances = Number(structure.allowances) * prorateRatio;
  const proratedDeductions = Number(structure.deductions) * prorateRatio;

  const totalEarnings = proratedBasic + proratedHra + proratedAllowances;
  const netSalary = totalEarnings - proratedDeductions;

  return salaryRepository.createSlip(companyId, {
    employeeId: employee.id,
    month,
    year,
    basicSalary: proratedBasic,
    hra: proratedHra,
    allowances: proratedAllowances,
    totalEarnings,
    totalDeductions: proratedDeductions,
    deductions: proratedDeductions,
    netSalary,
    workingDays: metrics.workingDays,
    totalDays: metrics.totalDays,
    holidayCount: metrics.holidayCount,
    paidLeaveDays: metrics.paidLeaveDays,
    lopDays: metrics.lopDays,
    payableDays: metrics.payableDays,
    generatedBy,
  });
}

exports.generateSlipForPayroll = async (companyId, employeeId, period, options = {}) => {
  const employee = await getEmployeeRecord(companyId, employeeId);
  const structure = await salaryRepository.findStructureByEmployeeId(companyId, employeeId);

  if (!structure) {
    throw new ApiError(404, "No salary structure found for this employee. Please set one first.");
  }

  return createSlipForPeriod(companyId, employee, structure, period, options);
};

exports.setSalaryStructure = async (companyId, user, payload) => {
  assertAdminOrOwner(user);
  await getEmployeeRecord(companyId, payload.employeeId);

  const structure = await salaryRepository.upsertStructure(companyId, payload);
  await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.SALARY_STRUCTURES, companyId);
  return structure;
};

exports.getSalaryStructure = async (companyId, user, employeeId) => {
  if (!hasPermission(user.role, ROLES.ADMIN)) {
    const me = await getEmployeeByUserId(companyId, user.id);
    if (me.id !== Number(employeeId)) {
      throw new ApiError(403, "You can only view your own salary structure");
    }
  }

  const cacheKey = cacheHelper.buildCacheKey(
    CACHE_NAMESPACES.SALARY_STRUCTURES,
    companyId,
    { empId: employeeId }
  );

  return cacheHelper.getOrSetJson(
    cacheKey,
    () => salaryRepository.findStructureByEmployeeId(companyId, employeeId),
    TTL.SALARY
  );
};

exports.generateSalarySlip = async (companyId, user, payload) => {
  assertAdminOrOwner(user);

  const slip = await exports.generateSlipForPayroll(
    companyId,
    payload.employeeId,
    { month: payload.month, year: payload.year, generatedBy: user.id }
  );

  await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.SALARY_SLIPS, companyId);
  return slip;
};

exports.getMySlips = async (companyId, user, query) => {
  const me = await getEmployeeByUserId(companyId, user.id);
  const cacheKey = cacheHelper.buildCacheKey(
    CACHE_NAMESPACES.SALARY_SLIPS,
    companyId,
    { empId: me.id, ...query }
  );

  return cacheHelper.getOrSetJson(
    cacheKey,
    () => salaryRepository.listSlipsByEmployee(companyId, me.id, query),
    TTL.SALARY
  );
};

exports.getCompanySlips = async (companyId, user, query) => {
  assertAdminOrOwner(user);
  const cacheKey = cacheHelper.buildCacheKey(
    CACHE_NAMESPACES.SALARY_SLIPS,
    companyId,
    { admin: true, ...query }
  );

  return cacheHelper.getOrSetJson(
    cacheKey,
    () => salaryRepository.listSlipsByCompany(companyId, query),
    TTL.SALARY
  );
};

exports.getSlipById = async (companyId, user, slipId) => {
  const slip = await salaryRepository.findSlipById(companyId, slipId);

  if (!slip) {
    throw new ApiError(404, "Salary slip not found");
  }

  if (!hasPermission(user.role, ROLES.ADMIN)) {
    const me = await getEmployeeByUserId(companyId, user.id);
    if (slip.employeeId !== me.id) {
      throw new ApiError(403, "You do not have permission to view this slip");
    }
  }

  return slip;
};
