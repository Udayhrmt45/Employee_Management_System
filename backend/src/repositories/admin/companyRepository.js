const { getDatabase } = require("../../config/database");

exports.getAllCompanies = async () => {
  const db = getDatabase();
  const query = `
    SELECT 
      c.id, c.name, c.domain, c.plan_type, c.is_active, c.created_at,
      COUNT(e.id) AS employee_count
    FROM companies c
    LEFT JOIN employees e ON c.id = e.company_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `;
  const { rows } = await db.query(query);
  return rows;
};

exports.getCompanyById = async (companyId) => {
  const db = getDatabase();
  const query = `
    SELECT 
      c.id, c.name, c.domain, c.plan_type, c.is_active, c.created_at,
      COUNT(e.id) AS employee_count
    FROM companies c
    LEFT JOIN employees e ON c.id = e.company_id
    WHERE c.id = $1
    GROUP BY c.id
  `;
  const { rows } = await db.query(query, [companyId]);
  return rows[0];
};

exports.updateCompanyStatus = async (companyId, isActive) => {
  const db = getDatabase();
  const query = `
    UPDATE companies
    SET is_active = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, name, is_active
  `;
  const { rows } = await db.query(query, [isActive, companyId]);
  return rows[0];
};
