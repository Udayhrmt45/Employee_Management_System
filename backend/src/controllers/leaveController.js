const leaveService = require("../services/leaveService");
const ApiResponse = require("../utils/apiResponse");
const validateRequest = require("../utils/requestValidator");
const {
  applyLeaveSchema,
  leaveDecisionSchema,
  leaveIdParamSchema,
  myLeaveSchema,
  teamLeaveSchema
} = require("../validations/leaveValidation");

exports.applyLeave = async (req, res) => {
  const body = validateRequest(applyLeaveSchema, req.body);
  const leave = await leaveService.applyLeave(req.companyId, req.user, body);
  res.status(201).json(ApiResponse.success(leave, "Leave application submitted"));
};

exports.getMyLeaves = async (req, res) => {
  const query = validateRequest(myLeaveSchema, req.query);
  const leaves = await leaveService.getMyLeaves(req.companyId, req.user, query);
  res.status(200).json(ApiResponse.success(leaves, "My leave records fetched successfully"));
};

exports.getTeamLeaves = async (req, res) => {
  const query = validateRequest(teamLeaveSchema, req.query);
  const leaves = await leaveService.getTeamLeaves(req.companyId, req.user, query);
  res.status(200).json(ApiResponse.success(leaves, "Team leave records fetched successfully"));
};

exports.getLeaveTypes = async (req, res) => {
  const leaveTypes = await leaveService.getLeaveTypes(req.companyId);
  res.status(200).json(ApiResponse.success(leaveTypes, "Leave types fetched successfully"));
};

exports.getMyLeaveBalances = async (req, res) => {
  const leaveBalances = await leaveService.getMyLeaveBalances(req.companyId, req.user);
  res.status(200).json(ApiResponse.success(leaveBalances, "Leave balances fetched successfully"));
};

exports.approveLeave = async (req, res) => {
  const params = validateRequest(leaveIdParamSchema, req.params);
  validateRequest(leaveDecisionSchema, req.body || {});
  const leave = await leaveService.approveLeave(req.companyId, req.user, params.id);
  res.status(200).json(ApiResponse.success(leave, "Leave approved successfully"));
};

exports.rejectLeave = async (req, res) => {
  const params = validateRequest(leaveIdParamSchema, req.params);
  validateRequest(leaveDecisionSchema, req.body || {});
  const leave = await leaveService.rejectLeave(req.companyId, req.user, params.id);
  res.status(200).json(ApiResponse.success(leave, "Leave rejected successfully"));
};
