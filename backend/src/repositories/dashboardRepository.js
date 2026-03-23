const { getDatabase } = require("../config/database");
const env = require("../config/env");

const LATE_ARRIVAL_TIME = env.attendance.lateArrivalCutoff;
const ATTENDANCE_TIMEZONE = env.attendance.timezone;
const ACTIVITY_LIMIT = 10;

function mapActivity(row) {
  if (!row) {
    return null;
  }

  return {
    id: `${row.type}-${row.id}`,
    employeeName: row.employee_name,
    action: row.action,
    occurredAt: row.occurred_at,
    status: row.status,
    type: row.type,
  };
}

exports.getSummary = async (companyId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT
       COALESCE((SELECT COUNT(*) FROM employees WHERE company_id = $1 AND status = 'ACTIVE'), 0) AS total_employees,
       COALESCE((
         SELECT COUNT(*)
         FROM attendance
         WHERE company_id = $1
           AND date = CURRENT_DATE
           AND status = 'PRESENT'
       ), 0) AS present_today,
       COALESCE((
         SELECT COUNT(*)
         FROM leave_requests
         WHERE company_id = $1
           AND status = 'APPROVED'
           AND CURRENT_DATE BETWEEN start_date AND end_date
       ), 0) AS on_leave,
       COALESCE((
         SELECT COUNT(*)
         FROM attendance
         WHERE company_id = $1
           AND date = CURRENT_DATE
           AND check_in IS NOT NULL
           AND ((check_in AT TIME ZONE 'UTC') AT TIME ZONE $3)::time > $2::time
       ), 0) AS late_arrivals`,
    [companyId, LATE_ARRIVAL_TIME, ATTENDANCE_TIMEZONE]
  );

  const row = rows[0] || {};

  return {
    totalEmployees: Number(row.total_employees || 0),
    presentToday: Number(row.present_today || 0),
    onLeave: Number(row.on_leave || 0),
    lateArrivals: Number(row.late_arrivals || 0),
  };
};

exports.getRecentActivity = async (companyId, limit = ACTIVITY_LIMIT) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT *
     FROM (
       SELECT
         a.id,
         e.name AS employee_name,
         CASE
           WHEN a.check_out IS NOT NULL THEN 'Checked Out'
           ELSE 'Checked In'
         END AS action,
         COALESCE(a.check_out, a.check_in, a.created_at) AS occurred_at,
         CASE
           WHEN a.check_out IS NOT NULL THEN 'Completed'
           WHEN a.check_in IS NOT NULL AND ((a.check_in AT TIME ZONE 'UTC') AT TIME ZONE $3)::time > $2::time THEN 'Late'
           ELSE 'On Time'
         END AS status,
         'attendance' AS type
       FROM attendance a
       INNER JOIN employees e ON e.id = a.employee_id
       WHERE a.company_id = $1
         AND (a.check_in IS NOT NULL OR a.check_out IS NOT NULL)

       UNION ALL

       SELECT
         lr.id,
         e.name AS employee_name,
         'Leave Request' AS action,
         lr.created_at AS occurred_at,
         INITCAP(lr.status::text) AS status,
         'leave' AS type
       FROM leave_requests lr
       INNER JOIN employees e ON e.id = lr.employee_id
       WHERE lr.company_id = $1
     ) recent_activity
     ORDER BY occurred_at DESC
     LIMIT $4`,
    [companyId, LATE_ARRIVAL_TIME, ATTENDANCE_TIMEZONE, limit]
  );

  return rows.map(mapActivity);
};
