const employeeService = require("../services/employeeService");
const ApiResponse = require("../utils/apiResponse");
const validateRequest = require("../utils/requestValidator");
const {
  createEmployeeSchema,
  employeeIdParamSchema,
  listEmployeeSchema,
  updateEmployeeSchema
} = require("../validations/employeeValidation");

exports.createEmployee = async (req, res) => {
  const body = validateRequest(createEmployeeSchema, req.body);
  const employee = await employeeService.createEmployee(req.companyId, body);
  res.status(201).json(ApiResponse.success(employee, "Employee created successfully"));
};

exports.listEmployees = async (req, res) => {
  const query = validateRequest(listEmployeeSchema, req.query);
  const employees = await employeeService.listEmployees(req.companyId, query);
  res.status(200).json(ApiResponse.success(employees, "Employees fetched successfully"));
};

exports.listTeamEmployees = async (req, res) => {
  const query = validateRequest(listEmployeeSchema, req.query);
  const employees = await employeeService.listTeamEmployees(req.companyId, req.user, query);
  res.status(200).json(ApiResponse.success(employees, "Team employees fetched successfully"));
};

exports.listDepartments = async (req, res) => {
  const departments = await employeeService.listDepartments(req.companyId);
  res.status(200).json(ApiResponse.success(departments, "Departments fetched successfully"));
};

exports.getEmployeeById = async (req, res) => {
  const params = validateRequest(employeeIdParamSchema, req.params);
  const employee = await employeeService.getEmployeeById(req.companyId, params.id);
  res.status(200).json(ApiResponse.success(employee, "Employee fetched successfully"));
};

exports.getEmployeeLeaveBalances = async (req, res) => {
  const params = validateRequest(employeeIdParamSchema, req.params);
  const leaveBalances = await employeeService.getEmployeeLeaveBalances(req.companyId, params.id, req.user);
  res.status(200).json(ApiResponse.success(leaveBalances, "Employee leave balances fetched successfully"));
};

exports.updateEmployee = async (req, res) => {
  const params = validateRequest(employeeIdParamSchema, req.params);
  const body = validateRequest(updateEmployeeSchema, req.body);
  const employee = await employeeService.updateEmployee(req.companyId, params.id, body, req.user);
  res.status(200).json(ApiResponse.success(employee, "Employee updated successfully"));
};

exports.deleteEmployee = async (req, res) => {
  const params = validateRequest(employeeIdParamSchema, req.params);
  await employeeService.deleteEmployee(req.companyId, params.id, req.user);
  res.status(200).json(ApiResponse.success(null, "Employee deleted successfully"));
};
