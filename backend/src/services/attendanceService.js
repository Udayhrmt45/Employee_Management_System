const attendanceRepository = require("../repositories/attendanceRepository");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const cacheHelper = require("../utils/cacheHelper");
const { CACHE_NAMESPACES } = cacheHelper;

const ATTENDANCE_TIMEZONE = env.attendance.timezone;

function getAttendanceTimeParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ATTENDANCE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  return formatter
    .formatToParts(date)
    .reduce((parts, part) => {
      if (part.type !== "literal") {
        parts[part.type] = part.value;
      }

      return parts;
    }, {});
}

function getCurrentDate() {
  const parts = getAttendanceTimeParts();
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getCurrentUtcTimestamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function parseStoredUtcTimestamp(value) {
  if (!value) {
    return null;
  }

  const normalizedValue = String(value).trim();
  const timestampMatch = normalizedValue.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})/);
  const isoValue = timestampMatch
    ? `${timestampMatch[1]}T${timestampMatch[2]}Z`
    : normalizedValue;

  return new Date(isoValue);
}

function roundHours(hours) {
  return Number(hours.toFixed(2));
}

// removed assertAdmin

async function getCurrentEmployee(companyId, userId) {
  const employee = await attendanceRepository.findEmployeeByUserId(companyId, userId);

  if (!employee) {
    throw new ApiError(404, "Employee profile not found for the authenticated user");
  }

  return employee;
}

exports.checkIn = async (companyId, userId, payload) => {
  const employee = await getCurrentEmployee(companyId, userId);
  const attendanceDate = payload.date || getCurrentDate();
  const existingAttendance = await attendanceRepository.findByEmployeeAndDate(companyId, employee.id, attendanceDate);

  if (existingAttendance?.checkIn) {
    throw new ApiError(409, "Employee has already checked in for this day");
  }

  try {
    const attendance = await attendanceRepository.createCheckIn(companyId, {
      employeeId: employee.id,
      date: attendanceDate,
      checkIn: payload.checkIn || getCurrentUtcTimestamp(),
      status: payload.status || "PRESENT"
    });
    await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.ATTENDANCE_DASHBOARD, companyId);
    await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.DASHBOARD_SUMMARY, companyId);
    return attendance;
  } catch (error) {
    if (error?.code === "23505") {
      throw new ApiError(409, "Only one attendance record is allowed per employee per day");
    }

    throw error;
  }
};

exports.checkOut = async (companyId, userId, payload) => {
  const employee = await getCurrentEmployee(companyId, userId);
  const attendanceDate = payload.date || getCurrentDate();
  const attendance = await attendanceRepository.findByEmployeeAndDate(companyId, employee.id, attendanceDate);

  if (!attendance) {
    throw new ApiError(404, "Attendance record not found for this day");
  }

  if (!attendance.checkIn) {
    throw new ApiError(400, "Cannot check out before check in");
  }

  if (attendance.checkOut) {
    throw new ApiError(409, "Employee has already checked out for this day");
  }

  const checkOutAt = payload.checkOut || getCurrentUtcTimestamp();
  const totalHours = roundHours(
    (parseStoredUtcTimestamp(checkOutAt) - parseStoredUtcTimestamp(attendance.rawCheckIn || attendance.checkIn)) / (1000 * 60 * 60)
  );

  if (Number.isNaN(totalHours) || totalHours < 0) {
    throw new ApiError(400, "Check-out time must be after check-in time");
  }

  const updatedAttendance = await attendanceRepository.completeCheckOut(companyId, attendance.id, {
    checkOut: checkOutAt,
    totalHours
  });
  await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.ATTENDANCE_DASHBOARD, companyId);
  await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.DASHBOARD_SUMMARY, companyId);
  return updatedAttendance;
};

exports.getMyAttendance = async (companyId, userId, query) => {
  const employee = await getCurrentEmployee(companyId, userId);
  return attendanceRepository.listEmployeeAttendance(companyId, employee.id, query);
};

exports.getTeamAttendance = async (companyId, user, query) => {
  if (user.role === "OWNER" || user.role === "SUPER_ADMIN") {
    const cacheKey = cacheHelper.buildCacheKey(CACHE_NAMESPACES.ATTENDANCE_DASHBOARD, companyId, { ...query, team: "all" });
    return cacheHelper.getOrSetJson(cacheKey, () => attendanceRepository.listCompanyAttendance(companyId, query));
  }
  const employee = await getCurrentEmployee(companyId, user.id);
  const teamQuery = { ...query, managerId: employee.id };
  const cacheKey = cacheHelper.buildCacheKey(CACHE_NAMESPACES.ATTENDANCE_DASHBOARD, companyId, teamQuery);
  return cacheHelper.getOrSetJson(cacheKey, () => attendanceRepository.listCompanyAttendance(companyId, teamQuery));
};

exports.exportTeamAttendance = async (companyId, user, query) => {
  let finalQuery = { ...query };
  if (user.role !== "OWNER" && user.role !== "SUPER_ADMIN") {
    const employee = await getCurrentEmployee(companyId, user.id);
    finalQuery = { ...query, managerId: employee.id };
  }
  return attendanceRepository.listCompanyAttendance(companyId, {
    ...finalQuery,
    page: 1,
    limit: 10000,
  });
};
