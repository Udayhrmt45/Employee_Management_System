const leaveRepository = require("../repositories/leaveRepository");
const employeeRepository = require("../repositories/employeeRepository");
const ApiError = require("../utils/ApiError");
const cacheHelper = require("../utils/cacheHelper");
const { CACHE_NAMESPACES } = cacheHelper;
const { canApproveLeave } = require("../utils/roleHierarchy");

function getInclusiveLeaveDays(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

async function getCurrentEmployee(companyId, userId) {
  const employee = await leaveRepository.findEmployeeByUserId(companyId, userId);

  if (!employee) {
    throw new ApiError(404, "Employee profile not found for the authenticated user");
  }

  return employee;
}

// removed assertAdmin function completely
exports.getLeaveTypes = async (companyId) => {
  return leaveRepository.listLeaveTypes(companyId);
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

  const requestedDays = getInclusiveLeaveDays(payload.startDate, payload.endDate);

  if (requestedDays <= 0) {
    throw new ApiError(400, "Invalid leave date range");
  }

  const leaveBalance = await leaveRepository.findLeaveBalance(employee.id, payload.leaveTypeId);

  if (!leaveBalance || Number(leaveBalance.balance) < requestedDays) {
    throw new ApiError(400, "Insufficient leave balance");
  }

  const leave = await leaveRepository.create(companyId, {
    employeeId: employee.id,
    leaveTypeId: payload.leaveTypeId,
    startDate: payload.startDate,
    endDate: payload.endDate,
    reason: payload.reason,
    status: "PENDING",
    approvedBy: null
  });
  await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.LEAVE_REQUESTS, companyId);
  await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.DASHBOARD_SUMMARY, companyId);
  return leave;
};

exports.getMyLeaves = async (companyId, user, query) => {
  const employee = await getCurrentEmployee(companyId, user.id);
  return leaveRepository.listByEmployee(companyId, employee.id, query);
};

exports.getTeamLeaves = async (companyId, user, query) => {
  if (user.role === "OWNER" || user.role === "SUPER_ADMIN") {
    const cacheKey = cacheHelper.buildCacheKey(CACHE_NAMESPACES.LEAVE_REQUESTS, companyId, { ...query, team: "all" });
    return cacheHelper.getOrSetJson(cacheKey, () => leaveRepository.listByCompany(companyId, query));
  }
  const employee = await getCurrentEmployee(companyId, user.id);
  const teamQuery = { ...query, managerId: employee.id };
  const cacheKey = cacheHelper.buildCacheKey(CACHE_NAMESPACES.LEAVE_REQUESTS, companyId, teamQuery);
  return cacheHelper.getOrSetJson(cacheKey, () => leaveRepository.listByCompany(companyId, teamQuery));
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

  const requestedDays = getInclusiveLeaveDays(leaveRequest.startDate, leaveRequest.endDate);
  const leaveBalance = await leaveRepository.findLeaveBalance(leaveRequest.employeeId, leaveRequest.leaveTypeId);

  if (!leaveBalance || Number(leaveBalance.balance) < requestedDays) {
    throw new ApiError(400, "Insufficient leave balance for approval");
  }

  try {
    const leave = await leaveRepository.updateRequestStatus(companyId, leaveRequestId, {
      status: "APPROVED",
      approvedBy: user.id,
      deductDays: requestedDays
    });
    await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.LEAVE_REQUESTS, companyId);
    await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.DASHBOARD_SUMMARY, companyId);
    return leave;
  } catch (error) {
    if (error?.message === "INSUFFICIENT_BALANCE") {
      throw new ApiError(400, "Insufficient leave balance for approval");
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

  try {
    const leave = await leaveRepository.updateRequestStatus(companyId, leaveRequestId, {
      status: "REJECTED",
      approvedBy: user.id,
      deductDays: 0
    });
    await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.LEAVE_REQUESTS, companyId);
    await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.DASHBOARD_SUMMARY, companyId);
    return leave;
  } catch (error) {
    if (error?.message === "INSUFFICIENT_BALANCE") {
      throw new ApiError(400, "Insufficient leave balance for approval");
    }

    throw error;
  }
};
