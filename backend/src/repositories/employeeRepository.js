const { getDatabase } = require("../config/database");
const { buildPagination } = require("../utils/pagination");

function mapEmployee(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    companyId: row.company_id,
    companyName: row.company_name,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    userRole: row.user_role,
    employeeCode: row.employee_code,
    name: row.name,
    email: row.email,
    phone: row.phone,
    departmentId: row.department_id,
    departmentName: row.department_name,
    designation: row.designation,
    joiningDate: row.joining_date,
    employmentType: row.employment_type,
    status: row.status,
    managerId: row.manager_id,
    managerName: row.manager_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function findDetailedById(companyId, employeeId) {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT
       e.id,
       e.company_id,
       c.name AS company_name,
       e.user_id,
       u.name AS user_name,
       u.email AS user_email,
       u.role AS user_role,
       e.employee_code,
       e.name,
       e.email,
       e.phone,
       e.department_id,
       d.name AS department_name,
       e.designation,
       e.joining_date,
       e.employment_type,
       e.status,
       e.created_at,
       e.updated_at
     FROM employees e
     INNER JOIN companies c ON c.id = e.company_id
     LEFT JOIN users u ON u.id = e.user_id AND u.company_id = e.company_id
     LEFT JOIN departments d ON d.id = e.department_id AND d.company_id = e.company_id
     LEFT JOIN employees m ON m.id = e.manager_id
     WHERE e.company_id = $1 AND e.id = $2
     LIMIT 1`,
    [companyId, employeeId]
  );

  return mapEmployee(rows[0]);
}

exports.create = async (companyId, payload) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `INSERT INTO employees
      (company_id, user_id, employee_code, name, email, phone, department_id, designation, joining_date, employment_type, status, manager_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id`,
    [
      companyId,
      payload.userId || null,
      payload.employeeCode || null,
      payload.name,
      payload.email || null,
      payload.phone || null,
      payload.departmentId || null,
      payload.designation || null,
      payload.joiningDate || null,
      payload.employmentType,
      payload.status,
      payload.managerId || null
    ]
  );

  return findDetailedById(companyId, rows[0].id);
};

exports.findByEmail = async (companyId, email, excludeEmployeeId = null) => {
  const db = getDatabase();
  const { rows } = excludeEmployeeId
    ? await db.query(
        "SELECT id, company_id, email FROM employees WHERE company_id = $1 AND email = $2 AND id != $3 LIMIT 1",
        [companyId, email, excludeEmployeeId]
      )
    : await db.query(
        "SELECT id, company_id, email FROM employees WHERE company_id = $1 AND email = $2 LIMIT 1",
        [companyId, email]
      );

  return rows[0] || null;
};

exports.findById = async (companyId, employeeId) => {
  return findDetailedById(companyId, employeeId);
};

exports.list = async (companyId, query) => {
  const db = getDatabase();
  const { page, limit, offset } = buildPagination(query.page, query.limit);
  const values = [companyId];
  const conditions = ["e.company_id = $1"];

  if (query.status) {
    values.push(query.status);
    conditions.push(`e.status = $${values.length}`);
  }

  if (query.departmentId) {
    values.push(query.departmentId);
    conditions.push(`e.department_id = $${values.length}`);
  }

  if (query.managerId !== undefined) {
    if (query.managerId === null) {
      conditions.push(`e.manager_id IS NULL`);
    } else {
      values.push(query.managerId);
      conditions.push(`e.manager_id = $${values.length}`);
    }
  }

  if (query.search) {
    values.push(`%${query.search}%`);
    const searchIndex = values.length;
    conditions.push(
      `(e.name ILIKE $${searchIndex} OR e.email ILIKE $${searchIndex} OR e.employee_code ILIKE $${searchIndex} OR e.designation ILIKE $${searchIndex})`
    );
  }

  const countValues = [...values];
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total
     FROM employees e
     WHERE ${conditions.join(" AND ")}`,
    countValues
  );

  values.push(limit, offset);
  const limitIndex = values.length - 1;
  const offsetIndex = values.length;

  const { rows } = await db.query(
    `SELECT
       e.id,
       e.company_id,
       c.name AS company_name,
       e.user_id,
       u.name AS user_name,
       u.email AS user_email,
       u.role AS user_role,
       e.employee_code,
       e.name,
       e.email,
       e.phone,
       e.department_id,
       d.name AS department_name,
       e.designation,
       e.joining_date,
       e.employment_type,
       e.status,
       e.created_at,
       e.updated_at
     FROM employees e
     INNER JOIN companies c ON c.id = e.company_id
     LEFT JOIN users u ON u.id = e.user_id AND u.company_id = e.company_id
     LEFT JOIN departments d ON d.id = e.department_id AND d.company_id = e.company_id
     LEFT JOIN employees m ON m.id = e.manager_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY e.created_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values
  );

  const total = Number(countRows[0]?.total || 0);

  return {
    items: rows.map(mapEmployee),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

exports.update = async (companyId, employeeId, payload) => {
  const db = getDatabase();
  const fields = [];
  const values = [];
  const fieldMap = {
    userId: "user_id",
    employeeCode: "employee_code",
    name: "name",
    email: "email",
    phone: "phone",
    departmentId: "department_id",
    designation: "designation",
    joiningDate: "joining_date",
    employmentType: "employment_type",
    status: "status",
    managerId: "manager_id"
  };

  Object.entries(fieldMap).forEach(([key, column]) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      values.push(payload[key]);
      fields.push(`${column} = $${values.length}`);
    }
  });

  if (!fields.length) {
    return findDetailedById(companyId, employeeId);
  }

  values.push(companyId, employeeId);
  const companyIndex = values.length - 1;
  const employeeIndex = values.length;

  await db.query(
    `UPDATE employees
     SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
     WHERE company_id = $${companyIndex} AND id = $${employeeIndex}`,
    values
  );

  return findDetailedById(companyId, employeeId);
};

exports.remove = async (companyId, employeeId) => {
  const db = getDatabase();
  const result = await db.query("DELETE FROM employees WHERE company_id = $1 AND id = $2", [companyId, employeeId]);

  return result.rowCount > 0;
};

exports.findDepartmentById = async (companyId, departmentId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    "SELECT id, company_id, name FROM departments WHERE company_id = $1 AND id = $2 LIMIT 1",
    [companyId, departmentId]
  );

  return rows[0] || null;
};

exports.listDepartments = async (companyId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT id, company_id, name
     FROM departments
     WHERE company_id = $1
     ORDER BY name ASC`,
    [companyId]
  );

  return rows.map((row) => ({
    id: row.id,
    companyId: row.company_id,
    name: row.name,
  }));
};

exports.findUserById = async (companyId, userId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    "SELECT id, company_id, name, email FROM users WHERE company_id = $1 AND id = $2 LIMIT 1",
    [companyId, userId]
  );

  return rows[0] || null;
};
