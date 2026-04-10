const salaryRepository = require("../repositories/salaryRepository");
const employeeRepository = require("../repositories/employeeRepository");
const ApiError = require("../utils/ApiError");
const cacheHelper = require("../utils/cacheHelper");
const { CACHE_NAMESPACES, TTL } = cacheHelper;
const { hasPermission, ROLES } = require("../utils/roleHierarchy");

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  // employeeRepository.findByUserId may vary — use findAll + filter as fallback
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

// ─── Service Methods ──────────────────────────────────────────────────────────

exports.setSalaryStructure = async (companyId, user, payload) => {
  assertAdminOrOwner(user);
  await getEmployeeRecord(companyId, payload.employeeId);

  const structure = await salaryRepository.upsertStructure(companyId, payload);

  // Invalidate cached structures for company
  await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.SALARY_STRUCTURES, companyId);

  return structure;
};

exports.getSalaryStructure = async (companyId, user, employeeId) => {
  // Employees can only view their own structure; Admins can view any
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
  const employee = await getEmployeeRecord(companyId, payload.employeeId);

  // Validate that the slip is not being generated before the employee's joining date
  if (employee.joiningDate) {
    const joiningDate = new Date(employee.joiningDate);
    const joiningYear = joiningDate.getFullYear();
    const joiningMonth = joiningDate.getMonth() + 1; // 1-indexed

    if (payload.year < joiningYear || (payload.year === joiningYear && payload.month < joiningMonth)) {
      throw new ApiError(400, "Cannot generate salary slip for a period before the employee's joining date.");
    }
  }

  const structure = await salaryRepository.findStructureByEmployeeId(
    companyId,
    payload.employeeId
  );

  if (!structure) {
    throw new ApiError(
      404,
      "No salary structure found for this employee. Please set one first."
    );
  }

  let totalDays = new Date(payload.year, payload.month, 0).getDate();
  let workingDays = totalDays;

  if (employee.joiningDate) {
    const joiningDate = new Date(employee.joiningDate);
    const joiningYear = joiningDate.getFullYear();
    const joiningMonth = joiningDate.getMonth() + 1; // 1-indexed

    if (payload.year === joiningYear && payload.month === joiningMonth) {
      workingDays = totalDays - joiningDate.getDate() + 1;
    }
  }

  const unpaidLeavesRaw = await salaryRepository.getApprovedUnpaidLeavesForMonth(
    companyId,
    payload.employeeId,
    payload.year,
    payload.month
  );

  let lopDays = 0;
  const monthStart = new Date(Date.UTC(payload.year, payload.month - 1, 1));
  const monthEnd = new Date(Date.UTC(payload.year, payload.month, 0, 23, 59, 59, 999));

  for (const leave of unpaidLeavesRaw) {
    let start = leave.start_date instanceof Date ? leave.start_date : new Date(leave.start_date);
    let end = leave.end_date instanceof Date ? leave.end_date : new Date(leave.end_date);

    if (start < monthStart) start = monthStart;
    if (end > monthEnd) end = monthEnd;

    if (start <= end) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      lopDays += (diffDays + 1);
    }
  }

  const payableDays = Math.max(0, workingDays - lopDays);
  const prorateRatio = payableDays / totalDays;

  const proratedBasic = structure.basicSalary * prorateRatio;
  const proratedHra = structure.hra * prorateRatio;
  const proratedAllowances = structure.allowances * prorateRatio;
  const proratedDeductions = structure.deductions * prorateRatio;

  const totalEarnings = proratedBasic + proratedHra + proratedAllowances;
  const netSalary = totalEarnings - proratedDeductions;

  const slip = await salaryRepository.createSlip(companyId, {
    employeeId: payload.employeeId,
    month: payload.month,
    year: payload.year,
    basicSalary: proratedBasic,
    hra: proratedHra,
    allowances: proratedAllowances,
    totalEarnings,
    totalDeductions: proratedDeductions,
    deductions: proratedDeductions,
    netSalary,
    workingDays,
    totalDays,
    lopDays,
    payableDays,
    generatedBy: user.id
  });

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

  // Employees may only access their own slip
  if (!hasPermission(user.role, ROLES.ADMIN)) {
    const me = await getEmployeeByUserId(companyId, user.id);
    if (slip.employeeId !== me.id) {
      throw new ApiError(403, "You do not have permission to view this slip");
    }
  }

  return slip;
};
