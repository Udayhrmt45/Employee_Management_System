const employeeRepository = require("../repositories/employeeRepository");
const leaveRepository = require("../repositories/leaveRepository");
const salaryRepository = require("../repositories/salaryRepository");
const ApiError = require("../utils/ApiError");
const cacheHelper = require("../utils/cacheHelper");
const { CACHE_NAMESPACES, TTL } = cacheHelper;
const { hasPermission, ROLES } = require("../utils/roleHierarchy");
const { clerkClient } = require("../config/clerk");

function normalizeEmployeeWriteError(error) {
  if (error?.code === "23505") {
    throw new ApiError(409, "Employee with this email or employee code already exists");
  }

  if (error?.code === "23503") {
    throw new ApiError(400, "Related user or department does not belong to this company");
  }

  throw error;
}

async function assertRelatedEntities(companyId, payload) {
  if (payload.departmentId) {
    const department = await employeeRepository.findDepartmentById(companyId, payload.departmentId);

    if (!department) {
      throw new ApiError(400, "Department not found for this company");
    }
  }

  if (payload.userId) {
    const user = await employeeRepository.findUserById(companyId, payload.userId);

    if (!user) {
      throw new ApiError(400, "User not found for this company");
    }
  }
}

exports.createEmployee = async (companyId, payload, user = null) => {
  const existingEmployee = payload.email
    ? await employeeRepository.findByEmail(companyId, payload.email)
    : null;

  if (existingEmployee) {
    throw new ApiError(409, "Employee with this email already exists");
  }

  await assertRelatedEntities(companyId, payload);

  try {
    const employee = await employeeRepository.create(companyId, {
      ...payload,
      employmentType: payload.employmentType || "FULL_TIME",
      status: payload.status || "ACTIVE"
    });
    await leaveRepository.initializeLeaveBalancesForEmployee(companyId, employee.id);

    if (payload.salary) {
      await salaryRepository.upsertStructure(companyId, {
        employeeId: employee.id,
        basicSalary: payload.salary.basicSalary,
        hra: payload.salary.hra,
        allowances: payload.salary.allowances,
        deductions: payload.salary.deductions,
        effectiveFrom: payload.salary.effectiveFrom || null
      });
      await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.SALARY_STRUCTURES, companyId);
    }

    await Promise.all([
      cacheHelper.invalidateNamespace(CACHE_NAMESPACES.EMPLOYEE_LIST, companyId),
      cacheHelper.invalidateNamespace(CACHE_NAMESPACES.DASHBOARD_SUMMARY, companyId)
    ]);

    // Send Clerk invite for them to claim this employee profile (shows in Team Management)
    if (payload.email) {
      try {
        await clerkClient.invitations.createInvitation({
          emailAddress: payload.email,
          ignoreExisting: true,
          publicMetadata: {
            invitedCompanyId: companyId,
            invitedEmployeeName: payload.name || payload.email,
            invitedDesignation: payload.designation || "Employee",
            invitedAppRole: "EMPLOYEE",
            invitedByUserId: user ? user.id : null,
            invitationSource: "employees"
          }
        });
      } catch (err) {
        console.error("Clerk invitation failed during employee creation", err.errors || err);
      }
    }

    return employee;
  } catch (error) {
    normalizeEmployeeWriteError(error);
  }
};

exports.listEmployees = async (companyId, query) => {
  const cacheKey = cacheHelper.buildCacheKey(CACHE_NAMESPACES.EMPLOYEE_LIST, companyId, query);
  return cacheHelper.getOrSetJson(cacheKey, () => employeeRepository.list(companyId, query), TTL.EMPLOYEE);
};

exports.listTeamEmployees = async (companyId, user, query) => {
  if (hasPermission(user.role, ROLES.OWNER)) {
    const cacheKey = cacheHelper.buildCacheKey(CACHE_NAMESPACES.EMPLOYEE_LIST, companyId, { ...query, team: "all" });
    return cacheHelper.getOrSetJson(cacheKey, () => employeeRepository.list(companyId, query), TTL.EMPLOYEE);
  }

  const employee = await employeeRepository.findEmployeeByUserId(companyId, user.id);
  if (!employee) {
    throw new ApiError(404, "Employee profile not found for the authenticated user");
  }

  const teamQuery = { ...query, managerId: employee.id };
  const cacheKey = cacheHelper.buildCacheKey(CACHE_NAMESPACES.EMPLOYEE_LIST, companyId, teamQuery);
  return cacheHelper.getOrSetJson(cacheKey, () => employeeRepository.list(companyId, teamQuery), TTL.EMPLOYEE);
};

exports.listDepartments = async (companyId) => {
  return employeeRepository.listDepartments(companyId);
};

exports.getEmployeeById = async (companyId, employeeId) => {
  const employee = await employeeRepository.findById(companyId, employeeId);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return employee;
};

exports.getEmployeeLeaveBalances = async (companyId, employeeId, user) => {
  if (!hasPermission(user.role, ROLES.ADMIN)) {
    throw new ApiError(403, "Only Admin or Owner users can view employee leave balances");
  }

  const employee = await employeeRepository.findById(companyId, employeeId);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return leaveRepository.listLeaveBalances(companyId, employeeId);
};

exports.updateEmployee = async (companyId, employeeId, payload, user) => {
  const existingEmployee = await employeeRepository.findById(companyId, employeeId);

  if (!existingEmployee) {
    throw new ApiError(404, "Employee not found");
  }

  if (payload.role && existingEmployee.userRole === "OWNER" && payload.role !== "OWNER") {
    const ownersCount = await employeeRepository.countOwners(companyId);
    if (ownersCount <= 1) {
      throw new ApiError(400, "Cannot demote the last OWNER of the company");
    }
  }

  const actorRole = user?.role;
  const targetRole = existingEmployee.userRole || ROLES.EMPLOYEE;

  // Authorize: Only Admins can edit anyone. Regular employees can only edit their own profile.
  if (!hasPermission(user.role, ROLES.ADMIN) && Number(existingEmployee.userId) !== Number(user.id)) {
    throw new ApiError(403, "You do not have permission to update this employee profile");
  }

  if (actorRole === ROLES.ADMIN && targetRole !== ROLES.EMPLOYEE) {
    throw new ApiError(403, "Admins can only update employee profiles");
  }

  if (payload.email) {
    const employeeWithEmail = await employeeRepository.findByEmail(companyId, payload.email, employeeId);

    if (employeeWithEmail) {
      throw new ApiError(409, "Employee with this email already exists");
    }
  }

  await assertRelatedEntities(companyId, payload);

  try {
    const employee = await employeeRepository.update(companyId, employeeId, payload);
    await Promise.all([
      cacheHelper.invalidateNamespace(CACHE_NAMESPACES.EMPLOYEE_LIST, companyId),
      cacheHelper.invalidateNamespace(CACHE_NAMESPACES.DASHBOARD_SUMMARY, companyId)
    ]);
    return employee;
  } catch (error) {
    normalizeEmployeeWriteError(error);
  }
};

exports.deleteEmployee = async (companyId, employeeId, user) => {
  const employee = await employeeRepository.findById(companyId, employeeId);
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const actorRole = user?.role;
  const targetRole = employee.userRole || ROLES.EMPLOYEE;

  if (actorRole === ROLES.ADMIN && targetRole !== ROLES.EMPLOYEE) {
    throw new ApiError(403, "Admins can only delete employees");
  }

  if (actorRole === ROLES.OWNER && ![ROLES.ADMIN, ROLES.EMPLOYEE].includes(targetRole)) {
    throw new ApiError(403, "Owners can only delete admins or employees");
  }

  if (employee.userRole === "OWNER") {
    const ownersCount = await employeeRepository.countOwners(companyId);
    if (ownersCount <= 1) {
      throw new ApiError(400, "Cannot delete the last OWNER of the company");
    }
  }

  const deleted = await employeeRepository.remove(companyId, employeeId);

  if (!deleted) {
    throw new ApiError(404, "Employee not found");
  }

  await Promise.all([
    cacheHelper.invalidateNamespace(CACHE_NAMESPACES.EMPLOYEE_LIST, companyId),
    cacheHelper.invalidateNamespace(CACHE_NAMESPACES.DASHBOARD_SUMMARY, companyId)
  ]);
};
