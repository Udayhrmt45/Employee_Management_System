const attendanceRepository = require("../repositories/attendanceRepository");
const ApiError = require("../utils/ApiError");
const cacheHelper = require("../utils/cacheHelper");
const { CACHE_NAMESPACES } = cacheHelper;

function getCurrentDate() {
  return new Date().toISOString().slice(0, 10);
}


function getLocalTimestamp() {
  const d = new Date();
  const tzo = -d.getTimezoneOffset();
  const ms = d.getTime() + tzo * 60000;
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
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
      checkIn: payload.checkIn || getLocalTimestamp(),
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

  const checkOutAt = payload.checkOut || getLocalTimestamp();
  const totalHours = roundHours((new Date(checkOutAt) - new Date(attendance.checkIn)) / (1000 * 60 * 60));

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
