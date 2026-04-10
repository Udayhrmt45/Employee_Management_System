const { getDatabase } = require("../config/database");
const { buildPagination } = require("../utils/pagination");

function mapLeaveRequest(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    companyId: row.company_id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    leaveTypeId: row.leave_type_id,
    leaveTypeName: row.leave_type_name,
    leaveTypeCategory: row.leave_type_category,
    startDate: row.start_date,
    endDate: row.end_date,
    reason: row.reason,
    status: row.status,
    effectiveDays: Number(row.effective_days || 0),
    paidDays: Number(row.paid_days || 0),
    unpaidDays: Number(row.unpaid_days || 0),
    approvedBy: row.approved_by,
    approvedByName: row.approved_by_name,
    createdAt: row.created_at
  };
}

async function getRequestDetails(companyId, requestId, client = getDatabase()) {
  const { rows } = await client.query(
    `SELECT
       lr.id,
       lr.company_id,
       lr.employee_id,
       e.name AS employee_name,
       lr.leave_type_id,
       lt.name AS leave_type_name,
       lt.type AS leave_type_category,
       lr.start_date,
       lr.end_date,
       lr.reason,
       lr.status,
       lr.effective_days,
       lr.paid_days,
       lr.unpaid_days,
       lr.approved_by,
       approver.name AS approved_by_name,
       lr.created_at
     FROM leave_requests lr
     INNER JOIN employees e ON e.id = lr.employee_id
     INNER JOIN leave_types lt ON lt.id = lr.leave_type_id
     LEFT JOIN users approver ON approver.id = lr.approved_by
     WHERE lr.company_id = $1 AND lr.id = $2
     LIMIT 1`,
    [companyId, requestId]
  );

  return mapLeaveRequest(rows[0]);
}

exports.create = async (companyId, payload) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `INSERT INTO leave_requests
      (company_id, employee_id, leave_type_id, start_date, end_date, reason, status, effective_days, paid_days, unpaid_days, approved_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id`,
    [
      companyId,
      payload.employeeId,
      payload.leaveTypeId,
      payload.startDate,
      payload.endDate,
      payload.reason,
      payload.status,
      payload.effectiveDays || 0,
      payload.paidDays || 0,
      payload.unpaidDays || 0,
      payload.approvedBy || null
    ]
  );

  return getRequestDetails(companyId, rows[0].id);
};

exports.findEmployeeByUserId = async (companyId, userId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT id, company_id, user_id, name, status, joining_date, paid_leave_balance
     FROM employees
     WHERE company_id = $1 AND user_id = $2
     LIMIT 1`,
    [companyId, userId]
  );

  if (!rows[0]) {
    return null;
  }

  return {
    ...rows[0],
    joiningDate: rows[0].joining_date,
    paidLeaveBalance: Number(rows[0].paid_leave_balance || 0),
  };
};

exports.findLeaveTypeById = async (companyId, leaveTypeId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT id, company_id, name, max_days, type
     FROM leave_types
     WHERE company_id = $1 AND id = $2
     LIMIT 1`,
    [companyId, leaveTypeId]
  );

  return rows[0] || null;
};

exports.listLeaveTypes = async (companyId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT id, company_id, name, max_days, type, created_at
     FROM leave_types
     WHERE company_id = $1
     ORDER BY name ASC`,
    [companyId]
  );

  return rows.map((row) => ({
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    maxDays: row.max_days,
    type: row.type || "PAID",
    createdAt: row.created_at,
  }));
};

exports.seedDefaultLeaveTypes = async (client, companyId, leaveTypes) => {
  const seededLeaveTypes = [];

  for (const leaveType of leaveTypes) {
    const existingLeaveType = await client.query(
      `SELECT id, company_id, name, max_days, type, created_at
       FROM leave_types
       WHERE company_id = $1 AND LOWER(name) = LOWER($2)
       LIMIT 1`,
      [companyId, leaveType.name]
    );

    if (existingLeaveType.rows[0]) {
      seededLeaveTypes.push({
        id: existingLeaveType.rows[0].id,
        companyId: existingLeaveType.rows[0].company_id,
        name: existingLeaveType.rows[0].name,
        maxDays: existingLeaveType.rows[0].max_days,
        type: existingLeaveType.rows[0].type || 'PAID',
        createdAt: existingLeaveType.rows[0].created_at,
      });
      continue;
    }

    const { rows } = await client.query(
      `INSERT INTO leave_types (company_id, name, max_days, type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, company_id, name, max_days, type, created_at`,
      [companyId, leaveType.name, leaveType.maxDays, leaveType.type || 'PAID']
    );

    seededLeaveTypes.push({
      id: rows[0].id,
      companyId: rows[0].company_id,
      name: rows[0].name,
      maxDays: rows[0].max_days,
      type: rows[0].type,
      createdAt: rows[0].created_at,
    });
  }

  return seededLeaveTypes;
};

exports.findLeaveBalance = async (employeeId, leaveTypeId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT id, employee_id, leave_type_id, balance
     FROM leave_balances
     WHERE employee_id = $1 AND leave_type_id = $2
     LIMIT 1`,
    [employeeId, leaveTypeId]
  );

  return rows[0] || null;
};

exports.findOverlappingRequests = async (companyId, employeeId, startDate, endDate, statuses = ["PENDING", "APPROVED"]) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT lr.id
     FROM leave_requests lr
     WHERE lr.company_id = $1
       AND lr.employee_id = $2
       AND lr.status = ANY($3::leave_status_enum[])
       AND lr.start_date <= $5
       AND lr.end_date >= $4`,
    [companyId, employeeId, statuses, startDate, endDate]
  );

  return rows;
};

exports.listLeaveBalances = async (companyId, employeeId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT
       lb.id,
       lb.employee_id,
       lb.leave_type_id,
       lb.balance,
       lb.updated_at,
       lt.name AS leave_type_name,
       lt.max_days
     FROM leave_balances lb
     INNER JOIN leave_types lt
       ON lt.id = lb.leave_type_id
      AND lt.company_id = $1
     WHERE lb.employee_id = $2
     ORDER BY lt.name ASC`,
    [companyId, employeeId]
  );

  return rows.map((row) => ({
    id: row.id,
    employeeId: row.employee_id,
    leaveTypeId: row.leave_type_id,
    leaveTypeName: row.leave_type_name,
    balance: Number(row.balance || 0),
    maxDays: Number(row.max_days || 0),
    updatedAt: row.updated_at,
  }));
};

exports.initializeLeaveBalancesForEmployee = async (companyId, employeeId, client = getDatabase()) => {
  const leaveTypesResult = await client.query(
    `SELECT id, max_days
     FROM leave_types
     WHERE company_id = $1`,
    [companyId]
  );

  const initializedBalances = [];

  for (const leaveType of leaveTypesResult.rows) {
    const { rows } = await client.query(
      `INSERT INTO leave_balances (employee_id, leave_type_id, balance, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (employee_id, leave_type_id) DO NOTHING
       RETURNING id, employee_id, leave_type_id, balance, updated_at`,
      [employeeId, leaveType.id, leaveType.max_days]
    );

    if (rows[0]) {
      initializedBalances.push(rows[0]);
    }
  }

  return initializedBalances;
};

exports.findRequestById = async (companyId, requestId) => {
  return getRequestDetails(companyId, requestId);
};

exports.listByEmployee = async (companyId, employeeId, query) => {
  const db = getDatabase();
  const { limit, offset } = buildPagination(query.page, query.limit);
  const { rows } = await db.query(
    `SELECT
       lr.id,
       lr.company_id,
       lr.employee_id,
       e.name AS employee_name,
       lr.leave_type_id,
       lt.name AS leave_type_name,
       lt.type AS leave_type_category,
       lr.start_date,
       lr.end_date,
       lr.reason,
       lr.status,
       lr.effective_days,
       lr.paid_days,
       lr.unpaid_days,
       lr.approved_by,
       approver.name AS approved_by_name,
       lr.created_at
     FROM leave_requests lr
     INNER JOIN employees e ON e.id = lr.employee_id
     INNER JOIN leave_types lt ON lt.id = lr.leave_type_id
     LEFT JOIN users approver ON approver.id = lr.approved_by
     WHERE lr.company_id = $1
       AND lr.employee_id = $2
       AND ($3::text IS NULL OR lr.status::text = $3)
     ORDER BY lr.created_at DESC
     LIMIT $4 OFFSET $5`,
    [companyId, employeeId, query.status || null, limit, offset]
  );

  return rows.map(mapLeaveRequest);
};

exports.listByCompany = async (companyId, query) => {
  const db = getDatabase();
  const { limit, offset } = buildPagination(query.page, query.limit);

  const values = [companyId, query.employeeId || null, query.status || null, limit, offset];
  let managerFilter = "";
  if (query.managerId !== undefined) {
    values.push(query.managerId);
    managerFilter = `AND e.manager_id = $6`;
  }

  const { rows } = await db.query(
    `SELECT
       lr.id,
       lr.company_id,
       lr.employee_id,
       e.name AS employee_name,
       lr.leave_type_id,
       lt.name AS leave_type_name,
       lt.type AS leave_type_category,
       lr.start_date,
       lr.end_date,
       lr.reason,
       lr.status,
       lr.effective_days,
       lr.paid_days,
       lr.unpaid_days,
       lr.approved_by,
       approver.name AS approved_by_name,
       lr.created_at
     FROM leave_requests lr
     INNER JOIN employees e ON e.id = lr.employee_id
     INNER JOIN leave_types lt ON lt.id = lr.leave_type_id
     LEFT JOIN users approver ON approver.id = lr.approved_by
     WHERE lr.company_id = $1
       AND ($2::bigint IS NULL OR lr.employee_id = $2)
       AND ($3::text IS NULL OR lr.status::text = $3)
       ${managerFilter}
     ORDER BY lr.created_at DESC
     LIMIT $4 OFFSET $5`,
    values
  );

  return rows.map(mapLeaveRequest);
};

exports.updateRequestStatus = async (companyId, requestId, payload) => {
  const db = getDatabase();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const leaveRequest = await getRequestDetails(companyId, requestId, client);

    if (!leaveRequest) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `UPDATE leave_requests
       SET status = $1, approved_by = $2
       WHERE company_id = $3 AND id = $4`,
      [payload.status, payload.approvedBy, companyId, requestId]
    );

    if (payload.status === "APPROVED" && payload.paidDays > 0) {
      const employeeUpdate = await client.query(
        `UPDATE employees
         SET paid_leave_balance = paid_leave_balance - $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE company_id = $2
           AND id = $3
           AND paid_leave_balance >= $1`,
        [payload.paidDays, companyId, leaveRequest.employeeId]
      );

      if (!employeeUpdate.rowCount) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      await client.query(
        `UPDATE leave_balances
         SET balance = GREATEST(balance - $1, 0),
             updated_at = CURRENT_TIMESTAMP
         WHERE employee_id = $2
           AND leave_type_id = $3`,
        [payload.paidDays, leaveRequest.employeeId, leaveRequest.leaveTypeId]
      );
    }

    await client.query("COMMIT");
    return getRequestDetails(companyId, requestId, client);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
