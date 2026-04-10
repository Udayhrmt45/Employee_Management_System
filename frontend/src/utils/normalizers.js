function titleCase(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTime(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const timeMatch = value.match(/\b(\d{2}):(\d{2})(?::\d{2})?\b/);

    if (timeMatch) {
      const hours24 = Number(timeMatch[1]);
      const minutes = timeMatch[2];
      const meridiem = hours24 >= 12 ? "PM" : "AM";
      const hours12 = hours24 % 12 || 12;

      return `${String(hours12).padStart(2, "0")}:${minutes} ${meridiem}`;
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const dateMatch = value.match(/^\d{4}-\d{2}-\d{2}/);

    if (dateMatch) {
      return dateMatch[0];
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function formatWorkedDuration(totalHours) {
  const hoursValue = Number(totalHours);

  if (!Number.isFinite(hoursValue) || hoursValue <= 0) {
    return "-";
  }

  const totalMinutes = Math.round(hoursValue * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min worked`;
  }

  if (minutes === 0) {
    return `${hours} ${hours === 1 ? "hr" : "hrs"} worked`;
  }

  return `${hours} ${hours === 1 ? "hr" : "hrs"} ${minutes} min worked`;
}

export function getApiData(response, fallback = []) {
  if (response?.data !== undefined) {
    return response.data;
  }

  return fallback;
}

export function getErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

export function normalizeEmployee(employee) {
  return {
    ...employee,
    paidLeaveBalance: Number(employee.paidLeaveBalance || 0),
    position: employee.designation || "Not assigned",
    department: employee.departmentName || "Unassigned",
    rawStatus: employee.status,
    status: titleCase(employee.status) || "Unknown",
    managerId: employee.managerId ? String(employee.managerId) : undefined,
    managerName: employee.managerName || undefined,
  };
}

export function normalizeAttendanceRecord(record) {
  return {
    ...record,
    date: formatDateOnly(record.attendanceDate),
    checkInTime: formatTime(record.checkIn),
    checkOutTime: formatTime(record.checkOut),
    notes: formatWorkedDuration(record.totalHours),
    rawStatus: record.status,
    status: titleCase(record.status) || "Unknown",
  };
}

export function normalizeLeaveRecord(record) {
  return {
    ...record,
    employee: record.employeeName || "Unknown employee",
    type: record.leaveTypeName || `Leave #${record.leaveTypeId}`,
    paidDays: Number(record.paidDays || 0),
    unpaidDays: Number(record.unpaidDays || 0),
    effectiveDays: Number(record.effectiveDays || 0),
    rawStatus: record.status,
    status: titleCase(record.status) || "Unknown",
  };
}
