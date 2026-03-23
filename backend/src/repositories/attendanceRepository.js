const { getDatabase } = require("../config/database");
const { buildPagination } = require("../utils/pagination");

const LATE_ARRIVAL_TIME = "09:00:00";

function mapAttendance(row) {
  if (!row) {
    return null;
  }

  const hasCheckIn = Boolean(row.check_in);
  const timeStr = hasCheckIn 
    ? (row.check_in instanceof Date ? row.check_in.toTimeString().slice(0, 8) : String(row.check_in).slice(11, 19))
    : null;
  const isLate = hasCheckIn && String(row.status) === "PRESENT" && timeStr > LATE_ARRIVAL_TIME;
  const derivedStatus = isLate ? "LATE" : row.status;

  return {
    id: row.id,
    companyId: row.company_id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    userId: row.user_id,
    attendanceDate: row.date,
    checkIn: row.check_in,
    checkOut: row.check_out,
    totalHours: row.total_hours,
    status: derivedStatus,
    createdAt: row.created_at
  };
}

async function findDetailedAttendanceById(companyId, attendanceId) {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT
       a.id,
       a.company_id,
       a.employee_id,
       e.name AS employee_name,
       e.user_id,
       a.date,
       a.check_in,
       a.check_out,
       a.total_hours,
       a.status,
       a.created_at
     FROM attendance a
     INNER JOIN employees e ON e.id = a.employee_id
     WHERE a.company_id = $1 AND a.id = $2
     LIMIT 1`,
    [companyId, attendanceId]
  );

  return mapAttendance(rows[0]);
}

exports.findEmployeeByUserId = async (companyId, userId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT id, company_id, user_id, name, status
     FROM employees
     WHERE company_id = $1 AND user_id = $2
     LIMIT 1`,
    [companyId, userId]
  );

  return rows[0] || null;
};

exports.findByEmployeeAndDate = async (companyId, employeeId, attendanceDate) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT
       a.id,
       a.company_id,
       a.employee_id,
       e.name AS employee_name,
       e.user_id,
       a.date,
       a.check_in,
       a.check_out,
       a.total_hours,
       a.status,
       a.created_at
     FROM attendance a
     INNER JOIN employees e ON e.id = a.employee_id
     WHERE a.company_id = $1 AND a.employee_id = $2 AND a.date = $3
     LIMIT 1`,
    [companyId, employeeId, attendanceDate]
  );

  return mapAttendance(rows[0]);
};

exports.createCheckIn = async (companyId, payload) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `INSERT INTO attendance (company_id, employee_id, date, check_in, total_hours, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [companyId, payload.employeeId, payload.date, payload.checkIn, null, payload.status]
  );

  return findDetailedAttendanceById(companyId, rows[0].id);
};

exports.completeCheckOut = async (companyId, attendanceId, payload) => {
  const db = getDatabase();
  await db.query(
    `UPDATE attendance
     SET check_out = $1, total_hours = $2
     WHERE company_id = $3 AND id = $4`,
    [payload.checkOut, payload.totalHours, companyId, attendanceId]
  );

  return findDetailedAttendanceById(companyId, attendanceId);
};

exports.listEmployeeAttendance = async (companyId, employeeId, query) => {
  const db = getDatabase();
  const { limit, offset } = buildPagination(query.page, query.limit);
  const { rows } = await db.query(
    `SELECT
       a.id,
       a.company_id,
       a.employee_id,
       e.name AS employee_name,
       e.user_id,
       a.date,
       a.check_in,
       a.check_out,
       a.total_hours,
       a.status,
       a.created_at
     FROM attendance a
     INNER JOIN employees e ON e.id = a.employee_id
     WHERE a.company_id = $1
       AND a.employee_id = $2
       AND ($3::date IS NULL OR a.date >= $3::date)
       AND ($4::date IS NULL OR a.date <= $4::date)
     ORDER BY a.date DESC, a.created_at DESC
     LIMIT $5 OFFSET $6`,
    [companyId, employeeId, query.dateFrom || null, query.dateTo || null, limit, offset]
  );

  return rows.map(mapAttendance);
};

exports.listCompanyAttendance = async (companyId, query) => {
  const db = getDatabase();
  const { limit, offset } = buildPagination(query.page, query.limit);
  const isSingleDateQuery = Boolean(query.dateFrom && query.dateTo && query.dateFrom === query.dateTo);
  const wantsLateStatus = query.status === "LATE";
  const persistedStatusFilter = wantsLateStatus ? "PRESENT" : query.status || null;
  const managerFilter = query.managerId ? `AND e.manager_id = ${Number(query.managerId)}` : "";
  const { rows } = isSingleDateQuery
    ? await db.query(
        `SELECT
           COALESCE(a.id, -e.id) AS id,
           e.company_id,
           e.id AS employee_id,
           e.name AS employee_name,
           e.user_id,
           COALESCE(a.date, $4::date) AS date,
           a.check_in,
           a.check_out,
           a.total_hours,
           COALESCE(a.status, 'ABSENT'::attendance_status_enum) AS status,
           COALESCE(a.created_at, e.created_at) AS created_at
         FROM employees e
         LEFT JOIN attendance a
           ON a.company_id = e.company_id
          AND a.employee_id = e.id
          AND a.date = $4::date
         WHERE e.company_id = $1
           AND e.status = 'ACTIVE'
           AND ($2::bigint IS NULL OR e.id = $2)
           AND ($3::text IS NULL OR COALESCE(a.status, 'ABSENT'::attendance_status_enum)::text = $3)
           ${wantsLateStatus ? "AND a.check_in IS NOT NULL AND a.check_in::time > $5::time" : ""}
           ${managerFilter}
         ORDER BY employee_name ASC
         LIMIT $${wantsLateStatus ? 6 : 5} OFFSET $${wantsLateStatus ? 7 : 6}`,
        wantsLateStatus
          ? [
              companyId,
              query.employeeId || null,
              persistedStatusFilter,
              query.dateFrom,
              LATE_ARRIVAL_TIME,
              limit,
              offset
            ]
          : [
              companyId,
              query.employeeId || null,
              persistedStatusFilter,
              query.dateFrom,
              limit,
              offset
            ]
      )
    : await db.query(
        `SELECT
           a.id,
           a.company_id,
           a.employee_id,
           e.name AS employee_name,
           e.user_id,
           a.date,
           a.check_in,
           a.check_out,
           a.total_hours,
           a.status,
           a.created_at
         FROM attendance a
         INNER JOIN employees e ON e.id = a.employee_id
         WHERE a.company_id = $1
           AND ($2::bigint IS NULL OR a.employee_id = $2)
           AND ($3::text IS NULL OR a.status::text = $3)
           AND ($4::date IS NULL OR a.date >= $4::date)
           AND ($5::date IS NULL OR a.date <= $5::date)
           ${wantsLateStatus ? "AND a.check_in IS NOT NULL AND a.check_in::time > $6::time" : ""}
           ${managerFilter}
         ORDER BY a.date DESC, a.created_at DESC
         LIMIT $7 OFFSET $8`,
        [
          companyId,
          query.employeeId || null,
          persistedStatusFilter,
          query.dateFrom || null,
          query.dateTo || null,
          LATE_ARRIVAL_TIME,
          limit,
          offset
        ]
      );

  return rows.map(mapAttendance);
};
