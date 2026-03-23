const departmentService = require("../services/departmentService");
const ApiResponse = require("../utils/apiResponse");
const validateRequest = require("../utils/requestValidator");
const {
  departmentIdParamSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
} = require("../validations/departmentValidation");

exports.listDepartments = async (req, res) => {
  const departments = await departmentService.listDepartments(req.companyId);
  res.status(200).json(ApiResponse.success(departments, "Departments fetched successfully"));
};

exports.createDepartment = async (req, res) => {
  const body = validateRequest(createDepartmentSchema, req.body);
  const department = await departmentService.createDepartment(req.companyId, req.user, body);
  res.status(201).json(ApiResponse.success(department, "Department created successfully"));
};

exports.updateDepartment = async (req, res) => {
  const params = validateRequest(departmentIdParamSchema, req.params);
  const body = validateRequest(updateDepartmentSchema, req.body);
  const department = await departmentService.updateDepartment(req.companyId, req.user, params.id, body);
  res.status(200).json(ApiResponse.success(department, "Department updated successfully"));
};

exports.deleteDepartment = async (req, res) => {
  const params = validateRequest(departmentIdParamSchema, req.params);
  const body = validateRequest(deleteDepartmentSchema, req.body || {});
  await departmentService.deleteDepartment(req.companyId, req.user, params.id, body);
  res.status(200).json(ApiResponse.success(null, "Department deleted successfully"));
};
