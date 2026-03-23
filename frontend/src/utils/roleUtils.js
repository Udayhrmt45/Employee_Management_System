export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE"
};

export const ROLE_RANKS = {
  [ROLES.SUPER_ADMIN]: 4,
  [ROLES.OWNER]: 3,
  [ROLES.ADMIN]: 2,
  [ROLES.EMPLOYEE]: 1
};

export function hasPermission(userRole, requiredRole) {
  const userRank = ROLE_RANKS[userRole] || 0;
  const requiredRank = ROLE_RANKS[requiredRole] || 0;
  return userRank >= requiredRank;
}
