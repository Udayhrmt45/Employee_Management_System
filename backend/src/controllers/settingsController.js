const settingsService = require("../services/settingsService");
const ApiResponse = require("../utils/apiResponse");
const validateRequest = require("../utils/requestValidator");
const {
  updateCompanySettingsSchema,
  inviteMemberSchema,
  removeMemberSchema,
} = require("../validations/settingsValidation");

exports.getCompanyProfile = async (req, res) => {
  const companyProfile = await settingsService.getCompanyProfile(req.companyId);
  res.status(200).json(ApiResponse.success(companyProfile, "Company profile fetched successfully"));
};

exports.updateCompanyProfile = async (req, res) => {
  const body = validateRequest(updateCompanySettingsSchema, req.body);
  const companyProfile = await settingsService.updateCompanyProfile(req.companyId, req.user, body);
  res.status(200).json(ApiResponse.success(companyProfile, "Company profile updated successfully"));
};

exports.getTeamMembers = async (req, res) => {
  const teamMembers = await settingsService.getTeamMembers(req.companyId);
  res.status(200).json(ApiResponse.success(teamMembers, "Team members fetched successfully"));
};

exports.inviteTeamMember = async (req, res) => {
  const body = validateRequest(inviteMemberSchema, req.body);
  const invitation = await settingsService.inviteTeamMember(req.companyId, req.user, body);
  res.status(201).json(ApiResponse.success(invitation, "Team member invited successfully"));
};

exports.removeTeamMember = async (req, res) => {
  const body = validateRequest(removeMemberSchema, {
    memberId: req.params.memberId,
    kind: req.query.kind,
  });
  await settingsService.removeTeamMember(req.companyId, req.user, body.memberId, body.kind);
  res.status(200).json(ApiResponse.success(null, "Team member removed successfully"));
};

exports.deleteCompanyProfile = async (req, res) => {
  await settingsService.deleteCompanyProfile(req.companyId, req.user);
  res.status(200).json(ApiResponse.success(null, "Company workspace and admin account deleted successfully"));
};
