const { getDatabase } = require("../config/database");

async function createCompany(client, companyName) {
  const { rows } = await client.query(
    `INSERT INTO companies (name)
     VALUES ($1)
     RETURNING id, name, created_at, updated_at`,
    [companyName]
  );

  return rows[0];
}

async function findCompanyById(client, companyId) {
  const { rows } = await client.query(
    `SELECT id, name, created_at, updated_at
     FROM companies
     WHERE id = $1
     LIMIT 1`,
    [companyId]
  );

  return rows[0] || null;
}

async function updateCompany(client, companyId, companyName) {
  const { rows } = await client.query(
    `UPDATE companies
     SET name = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, created_at, updated_at`,
    [companyName, companyId]
  );

  return rows[0] || null;
}

async function createUser(client, payload) {
  const { rows } = await client.query(
    `INSERT INTO users (clerk_user_id, company_id, name, email, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, clerk_user_id, company_id, name, email, role, created_at, updated_at`,
    [payload.clerkUserId, payload.companyId, payload.name, payload.email, payload.role]
  );

  return rows[0];
}

async function createOwnerEmployee(client, payload) {
  const { rows } = await client.query(
    `INSERT INTO employees (company_id, user_id, name, email, designation, status, employment_type)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 'FULL_TIME')
     RETURNING id`,
    [payload.companyId, payload.userId, payload.name, payload.email, payload.designation]
  );

  return rows[0];
}

async function createEmployeeProfile(client, payload) {
  const { rows } = await client.query(
    `INSERT INTO employees (company_id, user_id, name, email, designation, status, employment_type)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 'FULL_TIME')
     RETURNING id`,
    [payload.companyId, payload.userId || null, payload.name, payload.email || null, payload.designation || null]
  );

  return rows[0];
}

async function findOwnerEmployeeByUserId(client, userId) {
  const { rows } = await client.query(
    `SELECT id, company_id, user_id, name, email, designation
     FROM employees
     WHERE user_id = $1
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function createDepartments(client, companyId, departments) {
  if (!departments.length) {
    return [];
  }

  const insertedDepartments = [];

  for (const departmentName of departments) {
    const existingDepartment = await client.query(
      `SELECT id, company_id, name, created_at
       FROM departments
       WHERE company_id = $1 AND LOWER(name) = LOWER($2)
       LIMIT 1`,
      [companyId, departmentName]
    );

    if (existingDepartment.rows[0]) {
      insertedDepartments.push(existingDepartment.rows[0]);
      continue;
    }

    const { rows } = await client.query(
      `INSERT INTO departments (company_id, name)
       VALUES ($1, $2)
       RETURNING id, company_id, name, created_at`,
      [companyId, departmentName]
    );

    insertedDepartments.push(rows[0]);
  }

  return insertedDepartments;
}

module.exports = {
  createCompany,
  findCompanyById,
  updateCompany,
  createUser,
  createOwnerEmployee,
  createEmployeeProfile,
  findOwnerEmployeeByUserId,
  createDepartments,
  getDatabase,
};
