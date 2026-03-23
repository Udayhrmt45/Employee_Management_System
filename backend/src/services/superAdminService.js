const { getDatabase } = require("../config/database");
const logger = require("../utils/logger");

function getConfiguredSuperAdmin() {
  const clerkUserId = process.env.SUPER_ADMIN_CLERK_USER_ID || null;

  if (!clerkUserId) {
    return null;
  }

  return {
    clerkUserId,
    email: process.env.SUPER_ADMIN_EMAIL || null,
    name: process.env.SUPER_ADMIN_NAME || "Super Admin",
  };
}

exports.ensureSuperAdmin = async () => {
  const configuredSuperAdmin = getConfiguredSuperAdmin();

  if (!configuredSuperAdmin) {
    logger.info("SUPER_ADMIN_CLERK_USER_ID not configured; skipping super admin bootstrap");
    return;
  }

  const db = getDatabase();
  const existingUserResult = await db.query(
    `SELECT id, clerk_user_id, email, role
     FROM users
     WHERE clerk_user_id = $1
     LIMIT 1`,
    [configuredSuperAdmin.clerkUserId]
  );

  if (existingUserResult.rows[0]) {
    await db.query(
      `UPDATE users
       SET
         company_id = NULL,
         name = COALESCE($2, name),
         email = COALESCE($3, email),
         role = 'SUPER_ADMIN',
         updated_at = NOW()
       WHERE clerk_user_id = $1`,
      [
        configuredSuperAdmin.clerkUserId,
        configuredSuperAdmin.name,
        configuredSuperAdmin.email,
      ]
    );

    logger.info(`Super admin ensured for Clerk user ${configuredSuperAdmin.clerkUserId}`);
    return;
  }

  await db.query(
    `INSERT INTO users (clerk_user_id, company_id, name, email, role)
     VALUES ($1, NULL, $2, $3, 'SUPER_ADMIN')`,
    [
      configuredSuperAdmin.clerkUserId,
      configuredSuperAdmin.name,
      configuredSuperAdmin.email,
    ]
  );

  logger.info(`Super admin bootstrapped for Clerk user ${configuredSuperAdmin.clerkUserId}`);
};
