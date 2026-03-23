const { getDatabase } = require("../config/database");

async function ensureCompanySettingsTable(client = getDatabase()) {
  await client.query(
    `CREATE TABLE IF NOT EXISTS company_settings (
       company_id BIGINT PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
       support_email VARCHAR(255),
       website VARCHAR(255),
       phone VARCHAR(50),
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
     )`
  );
}

exports.findCompanyProfile = async (companyId) => {
  const db = getDatabase();
  await ensureCompanySettingsTable(db);

  const { rows } = await db.query(
    `SELECT
       c.id,
       c.name,
       c.domain,
       c.plan_type,
       cs.support_email,
       cs.website,
       cs.phone,
       c.created_at,
       c.updated_at
     FROM companies c
     LEFT JOIN company_settings cs ON cs.company_id = c.id
     WHERE c.id = $1
     LIMIT 1`,
    [companyId]
  );

  return rows[0] || null;
};

exports.upsertCompanyProfile = async (companyId, payload) => {
  const db = getDatabase();
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    await ensureCompanySettingsTable(client);

    const companyResult = await client.query(
      `UPDATE companies
       SET name = $1,
           domain = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, domain, plan_type, created_at, updated_at`,
      [payload.name, payload.domain || null, companyId]
    );

    if (!companyResult.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `INSERT INTO company_settings (company_id, support_email, website, phone, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (company_id)
       DO UPDATE SET
         support_email = EXCLUDED.support_email,
         website = EXCLUDED.website,
         phone = EXCLUDED.phone,
         updated_at = NOW()`,
      [
        companyId,
        payload.supportEmail || null,
        payload.website || null,
        payload.phone || null,
      ]
    );

    await client.query("COMMIT");

    return this.findCompanyProfile(companyId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.listActiveMembers = async (companyId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT
       u.id,
       u.clerk_user_id,
       u.name,
       u.email,
       u.role,
       e.id AS employee_id,
       e.designation,
       e.status AS employee_status,
       u.created_at
     FROM users u
     LEFT JOIN employees e ON e.user_id = u.id AND e.company_id = u.company_id
     WHERE u.company_id = $1
     ORDER BY u.created_at ASC`,
    [companyId]
  );

  return rows.map((row) => ({
    id: row.id,
    clerkUserId: row.clerk_user_id,
    name: row.name || row.email || "Unknown user",
    email: row.email,
    role: row.role,
    employeeId: row.employee_id || null,
    designation: row.designation || null,
    employeeStatus: row.employee_status || null,
    createdAt: row.created_at,
    kind: "user",
  }));
};

exports.removeMember = async (companyId, userId) => {
  const db = getDatabase();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `DELETE FROM employees
       WHERE company_id = $1 AND user_id = $2`,
      [companyId, userId]
    );

    const deleteResult = await client.query(
      `DELETE FROM users
       WHERE company_id = $1 AND id = $2`,
      [companyId, userId]
    );

    await client.query("COMMIT");
    return deleteResult.rowCount > 0;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.deleteCompany = async (companyId) => {
  const db = getDatabase();
  const deleteResult = await db.query(
    "DELETE FROM companies WHERE id = $1",
    [companyId]
  );
  return deleteResult.rowCount > 0;
};
