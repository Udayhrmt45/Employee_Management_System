const attendanceService = require("../services/attendanceService");
const ApiResponse = require("../utils/apiResponse");
const validateRequest = require("../utils/requestValidator");
const {
  checkInSchema,
  checkOutSchema,
  myAttendanceSchema,
  teamAttendanceSchema
} = require("../validations/attendanceValidation");

exports.checkIn = async (req, res) => {
  const body = validateRequest(checkInSchema, req.body);
  const attendance = await attendanceService.checkIn(req.companyId, req.user.id, body);
  res.status(201).json(ApiResponse.success(attendance, "Attendance check-in recorded"));
};

exports.checkOut = async (req, res) => {
  const body = validateRequest(checkOutSchema, req.body || {});
  const attendance = await attendanceService.checkOut(req.companyId, req.user.id, body);
  res.status(200).json(ApiResponse.success(attendance, "Attendance check-out recorded"));
};

exports.getMyAttendance = async (req, res) => {
  const query = validateRequest(myAttendanceSchema, req.query);
  const attendance = await attendanceService.getMyAttendance(req.companyId, req.user.id, query);
  res.status(200).json(ApiResponse.success(attendance, "Personal attendance fetched successfully"));
};

exports.getTeamAttendance = async (req, res) => {
  const query = validateRequest(teamAttendanceSchema, req.query);
  const attendance = await attendanceService.getTeamAttendance(req.companyId, req.user, query);
  res.status(200).json(ApiResponse.success(attendance, "Team attendance fetched successfully"));
};

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const normalizedValue = String(value).replace(/"/g, '""');
  return /[",\n]/.test(normalizedValue) ? `"${normalizedValue}"` : normalizedValue;
}

exports.exportTeamAttendance = async (req, res) => {
  const query = validateRequest(teamAttendanceSchema, req.query);
  const attendance = await attendanceService.exportTeamAttendance(req.companyId, req.user, query);

  const header = [
    "Employee Name",
    "Date",
    "Check In",
    "Check Out",
    "Total Hours",
    "Status",
  ];

  const rows = attendance.map((record) => ([
    record.employeeName,
    record.attendanceDate,
    record.checkIn,
    record.checkOut,
    record.totalHours,
    record.status,
  ].map(escapeCsvValue).join(",")));

  const csv = [header.join(","), ...rows].join("\n");
  const exportDate = new Date().toISOString().slice(0, 10);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"attendance-export-${exportDate}.csv\"`);
  res.status(200).send(csv);
};
