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
    notes: record.totalHours ? `${record.totalHours} hrs worked` : "-",
    rawStatus: record.status,
    status: titleCase(record.status) || "Unknown",
  };
}

export function normalizeLeaveRecord(record) {
  return {
    ...record,
    employee: record.employeeName || "Unknown employee",
    type: record.leaveTypeName || `Leave #${record.leaveTypeId}`,
    rawStatus: record.status,
    status: titleCase(record.status) || "Unknown",
  };
}
