const ApiError = require("../utils/ApiError");
const employeeRepository = require("../repositories/employeeRepository");
const { hasPermission, canManage, ROLES } = require("../utils/roleHierarchy");

exports.requireAdminAccess = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Unauthorized: User not authenticated"));
  }

  if (!hasPermission(req.user.role, ROLES.ADMIN)) {
    return next(new ApiError(403, "Forbidden: Administrator access required"));
  }

  return next();
};

exports.requireOwnerOnly = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Unauthorized: User not authenticated"));
  }

  if (!hasPermission(req.user.role, ROLES.OWNER)) {
    return next(new ApiError(403, "Forbidden: Owner access required"));
  }

  return next();
};

exports.requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Unauthorized: User not authenticated"));
  }

  if (!hasPermission(req.user.role, ROLES.SUPER_ADMIN)) {
    return next(new ApiError(403, "Forbidden: Super Administrator access required"));
  }

  return next();
};

// Aliased for backward compatibility if any missing routes still use it temporarily
exports.requireAdmin = exports.requireAdminAccess;

exports.requireManagerAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized: User not authenticated"));
    }

    const targetEmployeeId = req.params.id;
    if (!targetEmployeeId) {
      return next(new ApiError(400, "Bad Request: Target employee ID is required"));
    }

    const targetEmployee = await employeeRepository.findById(req.companyId, targetEmployeeId);
    if (!targetEmployee) {
      return next(new ApiError(404, "Target employee not found"));
    }

    const isSelf = Number(targetEmployee.userId) === Number(req.user.id);
    if (isSelf) {
      return next();
    }

    const targetUserRepresentation = { role: targetEmployee.userRole || "EMPLOYEE" };

    if (!canManage(req.user, targetUserRepresentation)) {
      return next(new ApiError(403, "Forbidden: You do not have permission to manage this employee"));
    }

    return next();
  } catch (err) {
    next(err);
  }
};
