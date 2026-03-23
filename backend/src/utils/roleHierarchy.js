const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE"
};

const ROLE_RANKS = {
  [ROLES.SUPER_ADMIN]: 4,
  [ROLES.OWNER]: 3,
  [ROLES.ADMIN]: 2,
  [ROLES.EMPLOYEE]: 1
};

function hasPermission(userRole, requiredRole) {
  const userRank = ROLE_RANKS[userRole] || 0;
  const requiredRank = ROLE_RANKS[requiredRole] || 0;
  return userRank >= requiredRank;
}

// Checks if 'user' has a higher or equal role rank to 'targetUser' for management purposes.
function canManage(user, targetUser) {
  if (user.role === ROLES.SUPER_ADMIN) return true;
  if (user.role === ROLES.OWNER) return true; // OWNER can manage everyone (ADMIN, EMPLOYEE, OWNER)
  
  if (user.role === ROLES.ADMIN) {
    return targetUser.role === ROLES.EMPLOYEE;
  }
  
  return false;
}

// Checks if 'user' can approve/reject leaves for 'targetUser' based on role rules.
function canApproveLeave(user, targetUser) {
  return canManage(user, targetUser);
}

module.exports = {
  ROLES,
  ROLE_RANKS,
  hasPermission,
  canManage,
  canApproveLeave
};
