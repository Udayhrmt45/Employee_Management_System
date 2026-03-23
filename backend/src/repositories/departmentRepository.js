const { getDatabase } = require("../config/database");

function mapDepartment(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    employeeCount: Number(row.employee_count || 0),
    createdAt: row.created_at,
  };
}

exports.findById = async (companyId, departmentId, client = getDatabase()) => {
  const { rows } = await client.query(
    `SELECT
       d.id,
       d.company_id,
       d.name,
       d.created_at,
       COUNT(e.id) FILTER (WHERE e.status = 'ACTIVE') AS employee_count
     FROM departments d
     LEFT JOIN employees e
       ON e.department_id = d.id
      AND e.company_id = d.company_id
     WHERE d.company_id = $1 AND d.id = $2
     GROUP BY d.id
     LIMIT 1`,
    [companyId, departmentId]
  );

  return mapDepartment(rows[0]);
};

exports.findByName = async (companyId, name, excludeDepartmentId = null, client = getDatabase()) => {
  const values = [companyId, name];
  const exclusionCondition = excludeDepartmentId ? `AND id != $3` : "";

  if (excludeDepartmentId) {
    values.push(excludeDepartmentId);
  }

  const { rows } = await client.query(
    `SELECT id, company_id, name, created_at
     FROM departments
     WHERE company_id = $1
       AND LOWER(name) = LOWER($2)
       ${exclusionCondition}
     LIMIT 1`,
    values
  );

  return rows[0] || null;
};

exports.list = async (companyId, client = getDatabase()) => {
  const { rows } = await client.query(
    `SELECT
       d.id,
       d.company_id,
       d.name,
       d.created_at,
       COUNT(e.id) FILTER (WHERE e.status = 'ACTIVE') AS employee_count
     FROM departments d
     LEFT JOIN employees e
       ON e.department_id = d.id
      AND e.company_id = d.company_id
     WHERE d.company_id = $1
     GROUP BY d.id
     ORDER BY LOWER(d.name) ASC`,
    [companyId]
  );

  return rows.map(mapDepartment);
};

exports.create = async (companyId, name, client = getDatabase()) => {
  const { rows } = await client.query(
    `INSERT INTO departments (company_id, name)
     VALUES ($1, $2)
     RETURNING id`,
    [companyId, name]
  );

  return this.findById(companyId, rows[0].id, client);
};

exports.update = async (companyId, departmentId, name, client = getDatabase()) => {
  await client.query(
    `UPDATE departments
     SET name = $1
     WHERE company_id = $2 AND id = $3`,
    [name, companyId, departmentId]
  );

  return this.findById(companyId, departmentId, client);
};

exports.reassignEmployees = async (companyId, departmentId, reassignDepartmentId, client = getDatabase()) => {
  await client.query(
    `UPDATE employees
     SET department_id = $1, updated_at = NOW()
     WHERE company_id = $2 AND department_id = $3`,
    [reassignDepartmentId, companyId, departmentId]
  );
};

exports.remove = async (companyId, departmentId, client = getDatabase()) => {
  const result = await client.query(
    `DELETE FROM departments
     WHERE company_id = $1 AND id = $2`,
    [companyId, departmentId]
  );

  return result.rowCount > 0;
};
