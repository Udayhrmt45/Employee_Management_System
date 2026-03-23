const { getDatabase } = require("../config/database");

exports.findByClerkUserId = async (clerkUserId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT id, clerk_user_id, company_id, name, email, role, created_at, updated_at
     FROM users
     WHERE clerk_user_id = $1
     LIMIT 1`,
    [clerkUserId]
  );

  return rows[0] || null;
};

exports.findProfileById = async (userId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT
       u.id,
       u.clerk_user_id,
       u.company_id,
       u.name,
       u.email,
       u.role,
       u.created_at,
       u.updated_at,
       c.name AS company_name,
       e.id AS employee_id,
       e.designation,
       e.department_id,
       d.name AS department_name,
       e.status AS employee_status,
       (u.role = 'SUPER_ADMIN' OR EXISTS(
         SELECT 1
         FROM departments d2
         WHERE d2.company_id = u.company_id
       )) AS workspace_initialized
     FROM users u
     LEFT JOIN companies c ON c.id = u.company_id
     LEFT JOIN employees e ON e.user_id = u.id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE u.id = $1
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
};
