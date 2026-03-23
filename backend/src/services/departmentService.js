const departmentRepository = require("../repositories/departmentRepository");
const cacheHelper = require("../utils/cacheHelper");
const ApiError = require("../utils/ApiError");
const { getDatabase } = require("../config/database");
const { hasPermission, ROLES } = require("../utils/roleHierarchy");

const { CACHE_NAMESPACES } = cacheHelper;

function assertAdmin(user) {
  if (!hasPermission(user.role, ROLES.ADMIN)) {
    throw new ApiError(403, "Only Admin or Owner users can manage departments");
  }
}

async function invalidateDepartmentRelatedCache(companyId) {
  await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.EMPLOYEE_LIST, companyId);
}

exports.listDepartments = async (companyId) => {
  return departmentRepository.list(companyId);
};

exports.createDepartment = async (companyId, user, payload) => {
  assertAdmin(user);

  const existingDepartment = await departmentRepository.findByName(companyId, payload.name);

  if (existingDepartment) {
    throw new ApiError(409, "A department with this name already exists");
  }

  const department = await departmentRepository.create(companyId, payload.name.trim());
  await invalidateDepartmentRelatedCache(companyId);
  return department;
};

exports.updateDepartment = async (companyId, user, departmentId, payload) => {
  assertAdmin(user);

  const existingDepartment = await departmentRepository.findById(companyId, departmentId);

  if (!existingDepartment) {
    throw new ApiError(404, "Department not found");
  }

  const duplicateDepartment = await departmentRepository.findByName(companyId, payload.name, departmentId);

  if (duplicateDepartment) {
    throw new ApiError(409, "A department with this name already exists");
  }

  const department = await departmentRepository.update(companyId, departmentId, payload.name.trim());
  await invalidateDepartmentRelatedCache(companyId);
  return department;
};

exports.deleteDepartment = async (companyId, user, departmentId, payload) => {
  assertAdmin(user);

  const department = await departmentRepository.findById(companyId, departmentId);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  if (payload.reassignDepartmentId && Number(payload.reassignDepartmentId) === Number(departmentId)) {
    throw new ApiError(422, "Department cannot be reassigned to itself");
  }

  const db = getDatabase();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    if (payload.reassignDepartmentId) {
      const targetDepartment = await departmentRepository.findById(companyId, payload.reassignDepartmentId, client);

      if (!targetDepartment) {
        throw new ApiError(404, "Reassignment department not found");
      }
    }

    await departmentRepository.reassignEmployees(
      companyId,
      departmentId,
      payload.reassignDepartmentId || null,
      client
    );

    const deleted = await departmentRepository.remove(companyId, departmentId, client);

    if (!deleted) {
      throw new ApiError(404, "Department not found");
    }

    await client.query("COMMIT");
    await invalidateDepartmentRelatedCache(companyId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
