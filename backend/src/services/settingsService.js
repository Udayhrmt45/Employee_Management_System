const { clerkClient } = require("../config/clerk");
const ApiError = require("../utils/ApiError");
const settingsRepository = require("../repositories/settingsRepository");
const { hasPermission, ROLES } = require("../utils/roleHierarchy");

function assertAdmin(user) {
  if (!hasPermission(user.role, ROLES.ADMIN)) {
    throw new ApiError(403, "Only Admin or Owner users can manage settings changes");
  }
}

function assertOwner(user) {
  if (!hasPermission(user.role, ROLES.OWNER)) {
    throw new ApiError(403, "Only the owner can delete the company workspace");
  }
}

function extractDomain(website) {
  if (!website) {
    return null;
  }

  try {
    return new URL(website).hostname;
  } catch (_error) {
    return null;
  }
}

function mapInvitationRole(role) {
  return String(role).toUpperCase() === "ADMIN" ? "ADMIN" : "EMPLOYEE";
}

function mapRoleLabel(role) {
  return String(role).toUpperCase() === "ADMIN" ? "Admin" : "Member";
}

exports.getCompanyProfile = async (companyId) => {
  const profile = await settingsRepository.findCompanyProfile(companyId);

  if (!profile) {
    throw new ApiError(404, "Company profile could not be found");
  }

  return {
    companyId: profile.id,
    name: profile.name,
    domain: profile.domain || null,
    supportEmail: profile.support_email || "",
    website: profile.website || "",
    phone: profile.phone || "",
    planType: profile.plan_type,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
};

exports.updateCompanyProfile = async (companyId, user, payload) => {
  assertAdmin(user);

  const updatedProfile = await settingsRepository.upsertCompanyProfile(companyId, {
    name: payload.name,
    domain: extractDomain(payload.website),
    supportEmail: payload.supportEmail,
    website: payload.website,
    phone: payload.phone,
  });

  if (!updatedProfile) {
    throw new ApiError(404, "Company profile could not be updated");
  }

  return exports.getCompanyProfile(companyId);
};

exports.getTeamMembers = async (companyId) => {
  const activeMembers = await settingsRepository.listActiveMembers(companyId);
  let invitationResponse = { data: [] };

  try {
    invitationResponse = await clerkClient.invitations.getInvitationList({ limit: 100 });
  } catch (_error) {
    invitationResponse = { data: [] };
  }

  const pendingInvitations = (Array.isArray(invitationResponse?.data) ? invitationResponse.data : [])
    .filter((invitation) => Number(invitation?.publicMetadata?.invitedCompanyId) === companyId)
    .map((invitation) => ({
      id: invitation.id,
      name: invitation.publicMetadata?.invitedEmployeeName || "Pending Invite",
      email: invitation.emailAddress,
      role: invitation.publicMetadata?.invitedAppRole || invitation.publicMetadata?.invitedDesignation || "EMPLOYEE",
      status: invitation.status || "PENDING",
      kind: "invitation",
      createdAt: invitation.createdAt || null,
    }));

  return {
    activeMembers,
    pendingInvitations,
  };
};

exports.inviteTeamMember = async (companyId, user, payload) => {
  assertAdmin(user);

  let invitation;
  try {
    invitation = await clerkClient.invitations.createInvitation({
      emailAddress: payload.email,
      ignoreExisting: true,
      publicMetadata: {
        invitedCompanyId: companyId,
        invitedEmployeeName: payload.name || payload.email,
        invitedDesignation: mapRoleLabel(payload.role),
        invitedAppRole: mapInvitationRole(payload.role),
        invitedByUserId: user.id,
        invitationSource: "settings",
      },
    });
  } catch (err) {
    console.error("Clerk API Error:", JSON.stringify(err.errors || err));
    const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Failed to invite user via Clerk API";
    throw new ApiError(400, msg);
  }

  return {
    id: invitation.id,
    email: invitation.emailAddress,
    status: invitation.status || "PENDING",
  };
};

exports.removeTeamMember = async (companyId, user, targetId, kind) => {
  assertAdmin(user);

  if (kind === "invitation") {
    await clerkClient.invitations.revokeInvitation(targetId);
    return;
  }

  const activeMembers = await settingsRepository.listActiveMembers(companyId);
  const member = activeMembers.find((entry) => String(entry.id) === String(targetId));

  if (!member) {
    throw new ApiError(404, "Team member not found");
  }

  if (member.role === "ADMIN" || member.role === "OWNER") {
    throw new ApiError(409, "Admin or Owner members cannot be removed from this screen");
  }

  const removed = await settingsRepository.removeMember(companyId, targetId);

  if (!removed) {
    throw new ApiError(404, "Team member not found");
  }
};

exports.deleteCompanyProfile = async (companyId, user) => {
  assertOwner(user);

  try {
    // Attempt to delete user from Clerk
    await clerkClient.users.deleteUser(user.clerkUserId);
  } catch (error) {
    if (error.status !== 404) {
      throw new ApiError(500, "Failed to remove user account from authentication provider");
    }
  }

  // Delete from local database (cascades automatically)
  const deleted = await settingsRepository.deleteCompany(companyId);
  
  if (!deleted) {
    throw new ApiError(404, "Company profile not found or could not be deleted");
  }
};
