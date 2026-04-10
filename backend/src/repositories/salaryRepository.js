const { getDatabase } = require("../config/database");
const { buildPagination } = require("../utils/pagination");

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapStructure(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    basicSalary: Number(row.basic_salary),
    hra: Number(row.hra),
    allowances: Number(row.allowances),
    deductions: Number(row.deductions),
    effectiveFrom: row.effective_from,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSlip(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    month: row.month,
    year: row.year,
    workingDays: Number(row.working_days || 0),
    totalDays: Number(row.total_days || 0),
    holidayCount: Number(row.holiday_count || 0),
    paidLeaveDays: Number(row.paid_leave_days || 0),
    lopDays: Number(row.lop_days || 0),
    payableDays: Number(row.payable_days || 0),
    basicSalary: Number(row.basic_salary),
    hra: Number(row.hra),
    allowances: Number(row.allowances),
    totalEarnings: Number(row.total_earnings),
    totalDeductions: Number(row.total_deductions),
    deductions: Number(row.deductions),
    netSalary: Number(row.net_salary),
    generatedBy: row.generated_by,
    generatedByName: row.generated_by_name,
    createdAt: row.created_at
  };
}

// ─── Salary Structures ────────────────────────────────────────────────────────

exports.upsertStructure = async (companyId, payload) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `INSERT INTO salary_structures
       (company_id, employee_id, basic_salary, hra, allowances, deductions, effective_from, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (company_id, employee_id) DO UPDATE SET
       basic_salary   = EXCLUDED.basic_salary,
       hra            = EXCLUDED.hra,
       allowances     = EXCLUDED.allowances,
       deductions     = EXCLUDED.deductions,
       effective_from = EXCLUDED.effective_from,
       updated_at     = NOW()
     RETURNING *`,
    [
      companyId,
      payload.employeeId,
      payload.basicSalary,
      payload.hra,
      payload.allowances,
      payload.deductions,
      payload.effectiveFrom || new Date().toISOString()
    ]
  );

  // Re-fetch with employee name
  return exports.findStructureByEmployeeId(companyId, payload.employeeId);
};

exports.findStructureByEmployeeId = async (companyId, employeeId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT
       ss.*,
       e.name AS employee_name
     FROM salary_structures ss
     INNER JOIN employees e ON e.id = ss.employee_id
     WHERE ss.company_id = $1 AND ss.employee_id = $2
     LIMIT 1`,
    [companyId, employeeId]
  );
  return mapStructure(rows[0]);
};

// ─── Salary Slips ─────────────────────────────────────────────────────────────

exports.createSlip = async (companyId, payload) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `INSERT INTO salary_slips
       (company_id, employee_id, month, year,
        basic_salary, hra, allowances,
        total_earnings, total_deductions, deductions, net_salary, working_days, total_days, holiday_count, paid_leave_days, lop_days, payable_days, generated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
     RETURNING id`,
    [
      companyId,
      payload.employeeId,
      payload.month,
      payload.year,
      payload.basicSalary,
      payload.hra,
      payload.allowances,
      payload.totalEarnings,
      payload.totalDeductions,
      payload.deductions,
      payload.netSalary,
      payload.workingDays,
      payload.totalDays,
      payload.holidayCount,
      payload.paidLeaveDays,
      payload.lopDays,
      payload.payableDays,
      payload.generatedBy
    ]
  );
  return exports.findSlipById(companyId, rows[0].id);
};

exports.findSlipByPeriod = async (companyId, employeeId, month, year) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT
       sl.*,
       e.name AS employee_name,
       g.name AS generated_by_name
     FROM salary_slips sl
     INNER JOIN employees e ON e.id = sl.employee_id
     LEFT JOIN users g ON g.id = sl.generated_by
     WHERE sl.company_id = $1
       AND sl.employee_id = $2
       AND sl.month = $3
       AND sl.year = $4
     LIMIT 1`,
    [companyId, employeeId, month, year]
  );

  return mapSlip(rows[0]);
};

exports.findSlipById = async (companyId, slipId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT
       sl.*,
       e.name  AS employee_name,
       g.name  AS generated_by_name
     FROM salary_slips sl
     INNER JOIN employees e ON e.id = sl.employee_id
     LEFT JOIN  users g     ON g.id  = sl.generated_by
     WHERE sl.company_id = $1 AND sl.id = $2
     LIMIT 1`,
    [companyId, slipId]
  );
  return mapSlip(rows[0]);
};

exports.listSlipsByEmployee = async (companyId, employeeId, query = {}) => {
  const db = getDatabase();
  const { limit, offset } = buildPagination(query.page, query.limit);
  const { rows } = await db.query(
    `SELECT
       sl.*,
       e.name  AS employee_name,
       g.name  AS generated_by_name
     FROM salary_slips sl
     INNER JOIN employees e ON e.id = sl.employee_id
     LEFT JOIN  users g     ON g.id  = sl.generated_by
     WHERE sl.company_id = $1
       AND sl.employee_id = $2
       AND ($3::int IS NULL OR sl.month = $3)
       AND ($4::int IS NULL OR sl.year  = $4)
     ORDER BY sl.year DESC, sl.month DESC
     LIMIT $5 OFFSET $6`,
    [companyId, employeeId, query.month || null, query.year || null, limit, offset]
  );
  return rows.map(mapSlip);
};

exports.listSlipsByCompany = async (companyId, query = {}) => {
  const db = getDatabase();
  const { limit, offset } = buildPagination(query.page, query.limit);
  const { rows } = await db.query(
    `SELECT
       sl.*,
       e.name  AS employee_name,
       g.name  AS generated_by_name
     FROM salary_slips sl
     INNER JOIN employees e ON e.id = sl.employee_id
     LEFT JOIN  users g     ON g.id  = sl.generated_by
     WHERE sl.company_id = $1
       AND ($2::bigint IS NULL OR sl.employee_id = $2)
       AND ($3::int    IS NULL OR sl.month = $3)
       AND ($4::int    IS NULL OR sl.year  = $4)
     ORDER BY sl.year DESC, sl.month DESC
     LIMIT $5 OFFSET $6`,
    [
      companyId,
      query.employeeId || null,
      query.month || null,
      query.year || null,
      limit,
      offset
    ]
  );
  return rows.map(mapSlip);
};

exports.getApprovedLeavesForMonth = async (companyId, employeeId, year, month) => {
  const db = getDatabase();
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const { rows } = await db.query(
    `SELECT lr.start_date, lr.end_date, lr.effective_days, lr.paid_days, lr.unpaid_days, lt.type
     FROM leave_requests lr
     INNER JOIN leave_types lt ON lr.leave_type_id = lt.id
     WHERE lr.company_id = $1 
       AND lr.employee_id = $2 
       AND lr.status = 'APPROVED' 
       AND lr.start_date <= $3
       AND lr.end_date >= $4`,
    [companyId, employeeId, endDate, startDate]
  );
  return rows;
};
