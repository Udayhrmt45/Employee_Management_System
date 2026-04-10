const leaveRepository = require("../repositories/leaveRepository");
const employeeRepository = require("../repositories/employeeRepository");
const holidayRepository = require("../repositories/holidayRepository");
const ApiError = require("../utils/ApiError");
const cacheHelper = require("../utils/cacheHelper");
const { CACHE_NAMESPACES, TTL } = cacheHelper;
const { canApproveLeave } = require("../utils/roleHierarchy");
const { enumerateDateKeys, formatDateKey, normalizeToUtcDate } = require("../utils/dateUtils");

async function getCurrentEmployee(companyId, userId) {
  const employee = await leaveRepository.findEmployeeByUserId(companyId, userId);

  if (!employee) {
    throw new ApiError(404, "Employee profile not found for the authenticated user");
  }

  return employee;
}

async function getHolidayDateSet(companyId, startDate, endDate) {
  const holidays = await holidayRepository.listBetween(companyId, startDate, endDate);
  return new Set(holidays.map((holiday) => formatDateKey(holiday.date)));
}

async function calculateLeaveBreakdown(companyId, employee, leaveType, startDate, endDate) {
  const holidayDateSet = await getHolidayDateSet(companyId, startDate, endDate);
  const joiningDateKey = employee.joiningDate ? formatDateKey(employee.joiningDate) : null;

  const effectiveDates = enumerateDateKeys(startDate, endDate).filter((dateKey) => {
    if (joiningDateKey && dateKey < joiningDateKey) {
      return false;
    }

    return !holidayDateSet.has(dateKey);
  });

  const effectiveDays = effectiveDates.length;

  if (effectiveDays <= 0) {
    throw new ApiError(400, "Selected leave dates do not contain any payable leave days after holidays and joining date");
  }

  if (leaveType.type === "UNPAID") {
    return {
      effectiveDays,
      paidDays: 0,
      unpaidDays: effectiveDays,
    };
  }

  const currentBalance = Number(employee.paidLeaveBalance || 0);
  const paidDays = Math.min(currentBalance, effectiveDays);
  const unpaidDays = Math.max(0, effectiveDays - paidDays);

  return {
    effectiveDays,
    paidDays,
    unpaidDays,
  };
}

exports.getLeaveTypes = async (companyId) => {
  const cacheKey = cacheHelper.buildCacheKey(CACHE_NAMESPACES.LEAVE_TYPES, companyId);
  return cacheHelper.getOrSetJson(
    cacheKey,
    () => leaveRepository.listLeaveTypes(companyId),
    TTL.LEAVE_TYPES
  );
};

exports.getMyLeaveBalances = async (companyId, user) => {
  const employee = await getCurrentEmployee(companyId, user.id);
  return leaveRepository.listLeaveBalances(companyId, employee.id);
};

exports.applyLeave = async (companyId, user, payload) => {
  const employee = await getCurrentEmployee(companyId, user.id);
  const leaveType = await leaveRepository.findLeaveTypeById(companyId, payload.leaveTypeId);

  if (!leaveType) {
    throw new ApiError(404, "Leave type not found");
  }

  const startDate = normalizeToUtcDate(payload.startDate);
  const endDate = normalizeToUtcDate(payload.endDate);

  if (!startDate || !endDate || endDate < startDate) {
    throw new ApiError(400, "Invalid leave date range");
  }

  const overlappingRequests = await leaveRepository.findOverlappingRequests(
    companyId,
    employee.id,
    payload.startDate,
    payload.endDate
  );

  if (overlappingRequests.length > 0) {
    throw new ApiError(409, "Leave request overlaps with an existing pending or approved leave");
  }

  const breakdown = await calculateLeaveBreakdown(companyId, employee, leaveType, payload.startDate, payload.endDate);

  const leave = await leaveRepository.create(companyId, {
    employeeId: employee.id,
    leaveTypeId: payload.leaveTypeId,
    startDate: payload.startDate,
    endDate: payload.endDate,
    reason: payload.reason,
    status: "PENDING",
    approvedBy: null,
    ...breakdown,
  });

  await Promise.all([
    cacheHelper.invalidateNamespace(CACHE_NAMESPACES.LEAVE_REQUESTS, companyId),
    cacheHelper.invalidateNamespace(CACHE_NAMESPACES.LEAVE_PERSONAL, companyId),
    cacheHelper.invalidateNamespace(CACHE_NAMESPACES.DASHBOARD_SUMMARY, companyId),
  ]);

  return leave;
};

exports.getMyLeaves = async (companyId, user, query) => {
  const employee = await getCurrentEmployee(companyId, user.id);
  const cacheKey = cacheHelper.buildCacheKey(
    CACHE_NAMESPACES.LEAVE_PERSONAL,
    companyId,
    { empId: employee.id, ...query }
  );

  return cacheHelper.getOrSetJson(
    cacheKey,
    () => leaveRepository.listByEmployee(companyId, employee.id, query),
    TTL.LEAVE
  );
};

exports.getTeamLeaves = async (companyId, user, query) => {
  if (user.role === "OWNER" || user.role === "SUPER_ADMIN") {
    const cacheKey = cacheHelper.buildCacheKey(CACHE_NAMESPACES.LEAVE_REQUESTS, companyId, { ...query, team: "all" });
    return cacheHelper.getOrSetJson(cacheKey, () => leaveRepository.listByCompany(companyId, query), TTL.LEAVE);
  }

  const employee = await getCurrentEmployee(companyId, user.id);
  const teamQuery = { ...query, managerId: employee.id };
  const cacheKey = cacheHelper.buildCacheKey(CACHE_NAMESPACES.LEAVE_REQUESTS, companyId, teamQuery);
  return cacheHelper.getOrSetJson(cacheKey, () => leaveRepository.listByCompany(companyId, teamQuery), TTL.LEAVE);
};

exports.approveLeave = async (companyId, user, leaveRequestId) => {
  const leaveRequest = await leaveRepository.findRequestById(companyId, leaveRequestId);

  if (!leaveRequest) {
    throw new ApiError(404, "Leave request not found");
  }

  const targetEmployee = await employeeRepository.findById(companyId, leaveRequest.employeeId);
  if (!canApproveLeave(user, { role: targetEmployee.userRole })) {
    throw new ApiError(403, "Only managers or owners can approve leave");
  }

  if (leaveRequest.status !== "PENDING") {
    throw new ApiError(409, "Only pending leave requests can be approved");
  }

  try {
    const leave = await leaveRepository.updateRequestStatus(companyId, leaveRequestId, {
      status: "APPROVED",
      approvedBy: user.id,
      paidDays: leaveRequest.paidDays || 0,
    });

    await Promise.all([
      cacheHelper.invalidateNamespace(CACHE_NAMESPACES.LEAVE_REQUESTS, companyId),
      cacheHelper.invalidateNamespace(CACHE_NAMESPACES.LEAVE_PERSONAL, companyId),
      cacheHelper.invalidateNamespace(CACHE_NAMESPACES.DASHBOARD_SUMMARY, companyId),
      cacheHelper.invalidateNamespace(CACHE_NAMESPACES.EMPLOYEE_LIST, companyId),
    ]);

    return leave;
  } catch (error) {
    if (error?.message === "INSUFFICIENT_BALANCE") {
      throw new ApiError(400, "Paid leave balance is no longer sufficient for approval");
    }

    throw error;
  }
};

exports.rejectLeave = async (companyId, user, leaveRequestId) => {
  const leaveRequest = await leaveRepository.findRequestById(companyId, leaveRequestId);

  if (!leaveRequest) {
    throw new ApiError(404, "Leave request not found");
  }

  const targetEmployee = await employeeRepository.findById(companyId, leaveRequest.employeeId);
  if (!canApproveLeave(user, { role: targetEmployee.userRole })) {
    throw new ApiError(403, "Only managers or owners can reject leave");
  }

  if (leaveRequest.status !== "PENDING") {
    throw new ApiError(409, "Only pending leave requests can be rejected");
  }

  const leave = await leaveRepository.updateRequestStatus(companyId, leaveRequestId, {
    status: "REJECTED",
    approvedBy: user.id,
    paidDays: 0,
  });

  await Promise.all([
    cacheHelper.invalidateNamespace(CACHE_NAMESPACES.LEAVE_REQUESTS, companyId),
    cacheHelper.invalidateNamespace(CACHE_NAMESPACES.LEAVE_PERSONAL, companyId),
    cacheHelper.invalidateNamespace(CACHE_NAMESPACES.DASHBOARD_SUMMARY, companyId),
  ]);

  return leave;
};
