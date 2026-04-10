const { getDatabase } = require("../config/database");

function mapHoliday(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    date: row.date,
    createdAt: row.created_at,
  };
}

exports.create = async (companyId, payload) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `INSERT INTO holidays (company_id, name, date)
     VALUES ($1, $2, $3)
     RETURNING id, company_id, name, date, created_at`,
    [companyId, payload.name, payload.date]
  );

  return mapHoliday(rows[0]);
};

exports.listByYear = async (companyId, year) => {
  const db = getDatabase();
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const { rows } = await db.query(
    `SELECT id, company_id, name, date, created_at
     FROM holidays
     WHERE company_id = $1
       AND date BETWEEN $2 AND $3
     ORDER BY date ASC, name ASC`,
    [companyId, yearStart, yearEnd]
  );

  return rows.map(mapHoliday);
};

exports.listBetween = async (companyId, startDate, endDate) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT id, company_id, name, date, created_at
     FROM holidays
     WHERE company_id = $1
       AND date BETWEEN $2 AND $3
     ORDER BY date ASC, name ASC`,
    [companyId, startDate, endDate]
  );

  return rows.map(mapHoliday);
};

exports.findByDate = async (companyId, date) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT id, company_id, name, date, created_at
     FROM holidays
     WHERE company_id = $1 AND date = $2
     LIMIT 1`,
    [companyId, date]
  );

  return mapHoliday(rows[0]);
};

exports.remove = async (companyId, id) => {
  const db = getDatabase();
  const result = await db.query(
    `DELETE FROM holidays
     WHERE company_id = $1 AND id = $2`,
    [companyId, id]
  );

  return result.rowCount > 0;
};
