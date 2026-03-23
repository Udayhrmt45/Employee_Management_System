const { getAuthenticatedUserId } = require("../config/clerk");
const authService = require("../services/authService");
const ApiResponse = require("../utils/apiResponse");
const validateRequest = require("../utils/requestValidator");
const { bootstrapWorkspaceSchema, inviteEmployeesSchema } = require("../validations/authValidation");
const ApiError = require("../utils/ApiError");

exports.bootstrapWorkspace = async (req, res) => {
  const { userId } = getAuthenticatedUserId(req);

  if (!userId) {
    throw new ApiError(401, "Unauthorized: invalid or missing Clerk session");
  }

  const body = validateRequest(bootstrapWorkspaceSchema, req.body);
  const workspace = await authService.bootstrapWorkspace(userId, body);

  res.status(200).json(ApiResponse.success(workspace, "Workspace initialized successfully"));
};

exports.inviteEmployees = async (req, res) => {
  const body = validateRequest(inviteEmployeesSchema, req.body);
  const result = await authService.inviteEmployees(req.companyId, req.user, body.employees);

  res.status(200).json(ApiResponse.success(result, "Employee invitations processed successfully"));
};

exports.getCurrentUser = async (req, res) => {
  const profile = await authService.getCurrentUserProfile(req.user.id);

  res.status(200).json(ApiResponse.success(profile, "Authenticated user profile fetched successfully"));
};
