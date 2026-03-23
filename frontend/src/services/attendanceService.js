import api from './api';

const MAX_ATTENDANCE_PAGE_SIZE = 100;

export const checkIn = async (payload = {}) => {
  return await api.post('/attendance/checkin', payload);
};

export const checkOut = async () => {
  return await api.post('/attendance/checkout', {});
};

export const getAttendance = async () => {
  return await api.get('/attendance/me');
};

export const getTeamAttendance = async (filters = {}) => {
  const normalizedLimit = filters.limit
    ? Math.min(Number(filters.limit), MAX_ATTENDANCE_PAGE_SIZE)
    : undefined;

  return await api.get('/attendance/team', {
    params: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      status: filters.status,
      employeeId: filters.employeeId,
      page: filters.page,
      limit: normalizedLimit,
    },
  });
};

export const exportAttendanceCsv = async (filters = {}) => {
  return await api.get('/attendance/export', {
    params: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      status: filters.status,
      employeeId: filters.employeeId,
    },
    responseType: 'blob',
  });
};
