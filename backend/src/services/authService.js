const { clerkClient } = require("../config/clerk");
const ApiError = require("../utils/ApiError");
const authRepository = require("../repositories/authRepository");
const userRepository = require("../repositories/userRepository");
const leaveRepository = require("../repositories/leaveRepository");

const DEFAULT_LEAVE_TYPES = [
  { name: "Paid Leave", maxDays: 18, type: "PAID" },
  { name: "Sick Leave", maxDays: 12, type: "PAID" },
  { name: "Casual Leave", maxDays: 6, type: "PAID" },
  { name: "Unpaid Leave", maxDays: 0, type: "UNPAID" },
];

function getPrimaryEmail(clerkUser) {
  if (clerkUser.primaryEmailAddress?.emailAddress) {
    return clerkUser.primaryEmailAddress.emailAddress;
  }

  const primaryEmail = clerkUser.emailAddresses?.find(
    (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId
  );

  return primaryEmail?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || null;
}

function getDisplayName(clerkUser) {
  const firstName = clerkUser.firstName || "";
  const lastName = clerkUser.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  return clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress || "Workspace Owner";
}

function getDefaultCompanyName(clerkUser) {
  return `${getDisplayName(clerkUser)}'s Workspace`;
}

function normalizeDepartments(departments = []) {
  return [...new Set(departments.map((department) => department.trim()).filter(Boolean))];
}

function normalizeInvitedEmployees(employees = []) {
  const seenEmails = new Set();

  return employees
    .map((employee) => ({
      name: employee?.name?.trim() || "",
      email: employee?.email?.trim().toLowerCase() || "",
      role: employee?.role?.trim() || "",
    }))
    .filter((employee) => employee.email)
    .filter((employee) => {
      if (seenEmails.has(employee.email)) {
        return false;
      }

      seenEmails.add(employee.email);
      return true;
    });
}

function getInvitedCompanyId(clerkUser) {
  const companyId = clerkUser?.publicMetadata?.invitedCompanyId;
  const normalizedCompanyId = Number(companyId);

  return Number.isInteger(normalizedCompanyId) && normalizedCompanyId > 0
    ? normalizedCompanyId
    : null;
}

function getInvitedEmployeeName(clerkUser) {
  const invitedName = clerkUser?.publicMetadata?.invitedEmployeeName;

  return typeof invitedName === "string" && invitedName.trim()
    ? invitedName.trim()
    : getDisplayName(clerkUser);
}

function getInvitedEmployeeDesignation(clerkUser) {
  const invitedDesignation = clerkUser?.publicMetadata?.invitedDesignation;

  return typeof invitedDesignation === "string" && invitedDesignation.trim()
    ? invitedDesignation.trim()
    : null;
}

function getInvitedAppRole(clerkUser) {
  const invitedRole = clerkUser?.publicMetadata?.invitedAppRole;
  return invitedRole === "ADMIN" ? "ADMIN" : "EMPLOYEE";
}

async function getClerkUserProfile(clerkUserId) {
  try {
    return await clerkClient.users.getUser(clerkUserId);
  } catch (error) {
    throw new ApiError(401, "Unauthorized: unable to fetch Clerk user profile");
  }
}

async function provisionWorkspaceForClerkUser(clerkUserId) {
  const existingUser = await userRepository.findByClerkUserId(clerkUserId);

  if (existingUser) {
    return {
      user: existingUser,
      companyId: existingUser.company_id,
      alreadyInitialized: true,
    };
  }

  const clerkUser = await getClerkUserProfile(clerkUserId);
  const invitedCompanyId = getInvitedCompanyId(clerkUser);
  const db = authRepository.getDatabase();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    let company;
    let user;
    let departments = [];

    if (invitedCompanyId) {
      company = await authRepository.findCompanyById(client, invitedCompanyId);

      if (!company) {
        throw new ApiError(404, "Invited company could not be found");
      }

      user = await authRepository.createUser(client, {
        clerkUserId,
        companyId: company.id,
        name: getInvitedEmployeeName(clerkUser),
        email: getPrimaryEmail(clerkUser),
        role: getInvitedAppRole(clerkUser),
      });

      const invitedEmployee = await authRepository.createEmployeeProfile(client, {
        companyId: company.id,
        userId: user.id,
        name: user.name || getInvitedEmployeeName(clerkUser),
        email: user.email,
        designation: getInvitedEmployeeDesignation(clerkUser),
      });
      await leaveRepository.initializeLeaveBalancesForEmployee(company.id, invitedEmployee.id, client);
    } else {
      company = await authRepository.createCompany(client, getDefaultCompanyName(clerkUser));
      user = await authRepository.createUser(client, {
        clerkUserId,
        companyId: company.id,
        name: getDisplayName(clerkUser),
        email: getPrimaryEmail(clerkUser),
        role: "OWNER",
      });

      const ownerEmployee = await authRepository.createOwnerEmployee(client, {
        companyId: company.id,
        userId: user.id,
        name: user.name || getDisplayName(clerkUser),
        email: user.email,
        designation: "Administrator",
      });
      await leaveRepository.seedDefaultLeaveTypes(client, company.id, DEFAULT_LEAVE_TYPES);
      await leaveRepository.initializeLeaveBalancesForEmployee(company.id, ownerEmployee.id, client);
    }

    await client.query("COMMIT");

    return {
      user,
      company,
      departments,
      alreadyInitialized: false,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
      client.release();
  }
}

exports.ensureWorkspaceForClerkUser = async (clerkUserId) => {
  const provisionedWorkspace = await provisionWorkspaceForClerkUser(clerkUserId);

  if (provisionedWorkspace.user) {
    return provisionedWorkspace;
  }

  throw new ApiError(500, "Unable to provision workspace for authenticated user");
};

exports.bootstrapWorkspace = async (clerkUserId, payload) => {
  const provisionedWorkspace = await provisionWorkspaceForClerkUser(clerkUserId);
  const companyId = provisionedWorkspace.user.company_id;
  const db = authRepository.getDatabase();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const company = await authRepository.updateCompany(client, companyId, payload.companyName);

    if (!company) {
      throw new ApiError(404, "Company not found for authenticated user");
    }

    const existingEmployee = await authRepository.findOwnerEmployeeByUserId(client, provisionedWorkspace.user.id);

    const departments = await authRepository.createDepartments(
      client,
      companyId,
      normalizeDepartments(payload.departments)
    );

    const leaveTypes = await leaveRepository.seedDefaultLeaveTypes(
      client,
      companyId,
      DEFAULT_LEAVE_TYPES
    );

    if (!existingEmployee) {
      const ownerEmployee = await authRepository.createOwnerEmployee(client, {
        companyId,
        userId: provisionedWorkspace.user.id,
        name: provisionedWorkspace.user.name || payload.companyName,
        email: provisionedWorkspace.user.email,
        designation: "Administrator",
      });
      await leaveRepository.initializeLeaveBalancesForEmployee(companyId, ownerEmployee.id, client);
    }

    await client.query("COMMIT");

    return {
      user: provisionedWorkspace.user,
      company,
      departments,
      leaveTypes,
      alreadyInitialized: provisionedWorkspace.alreadyInitialized,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.inviteEmployees = async (companyId, currentUser, employees) => {
  if (currentUser.role !== "ADMIN") {
    throw new ApiError(403, "Only ADMIN users can send employee invitations");
  }

  const normalizedEmployees = normalizeInvitedEmployees(employees);

  if (!normalizedEmployees.length) {
    return {
      invited: [],
      failed: [],
      skipped: [],
    };
  }

  const invited = [];
  const failed = [];
  const skipped = [];

  for (const employee of normalizedEmployees) {
    try {
      const invitation = await clerkClient.invitations.createInvitation({
        emailAddress: employee.email,
        publicMetadata: {
          invitedCompanyId: companyId,
          invitedEmployeeName: employee.name || employee.email,
          invitedDesignation: employee.role || null,
          invitedByUserId: currentUser.id,
          invitationSource: "onboarding",
        },
      });

      invited.push({
        email: employee.email,
        invitationId: invitation.id,
        status: invitation.status || "pending",
      });
    } catch (error) {
      const message =
        error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        error?.message ||
        "Unable to send invitation";

      if (String(message).toLowerCase().includes("already")) {
        skipped.push({
          email: employee.email,
          reason: message,
        });
      } else {
        failed.push({
          email: employee.email,
          reason: message,
        });
      }
    }
  }

  return {
    invited,
    failed,
    skipped,
  };
};

exports.getCurrentUserProfile = async (userId) => {
  const profile = await userRepository.findProfileById(userId);

  if (!profile) {
    throw new ApiError(404, "Authenticated user profile could not be found");
  }

  return {
    id: profile.id,
    clerkUserId: profile.clerk_user_id,
    companyId: profile.company_id,
    companyName: profile.company_name,
    employeeId: profile.employee_id || null,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    designation: profile.designation || null,
    departmentId: profile.department_id || null,
    departmentName: profile.department_name || null,
    employeeStatus: profile.employee_status || null,
    workspaceInitialized: Boolean(profile.workspace_initialized),
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
};
