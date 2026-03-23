import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendance, getTeamAttendance, checkIn, checkOut, exportAttendanceCsv } from '@/services/attendanceService';
import { toast } from 'sonner';
import { getApiData, getErrorMessage, normalizeAttendanceRecord } from '@/utils/normalizers';

const MAX_ATTENDANCE_PAGE_SIZE = 100;

const fetchAttendance = async () => {
  const response = await getAttendance();
  const attendance = getApiData(response);

  return Array.isArray(attendance)
    ? attendance.map(normalizeAttendanceRecord)
    : [];
};

export function useAttendance() {
  const {
    data: records = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['attendance'],
    queryFn: fetchAttendance,
    staleTime: 1000 * 60 * 2, // 2 minutes caching
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 mins for live dashboards
    retry: 1,
  });

  // Use local timezone offset to get local YYYY-MM-DD string
  const d = new Date();
  const todayDateString = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const todayAttendance = records.find((record) => record.date === todayDateString) || null;

  return {
    records,
    todayAttendance,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load attendance records.'),
    refetch,
  };
}

const fetchTeamAttendance = async (filters) => {
  const response = await getTeamAttendance(filters);
  const attendance = getApiData(response);

  return Array.isArray(attendance)
    ? attendance.map(normalizeAttendanceRecord)
    : [];
};

export function useTeamAttendance(filters = {}, enabled = true) {
  const normalizedFilters = {
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    status: filters.status || undefined,
    employeeId: filters.employeeId || undefined,
    page: filters.page || 1,
    limit: Math.min(filters.limit || MAX_ATTENDANCE_PAGE_SIZE, MAX_ATTENDANCE_PAGE_SIZE),
  };

  const {
    data: records = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['attendance', 'team', normalizedFilters],
    queryFn: () => fetchTeamAttendance(normalizedFilters),
    enabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  return {
    records,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load team attendance.'),
    refetch,
  };
}

// Check-in / Check-out specific Dashboard Mutations
export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Successfully checked in', { description: "Your attendance has been recorded for today." });
    },
    onError: (error) => {
      toast.error('Check-in failed', { description: getErrorMessage(error, 'Unable to record attendance.') });
    }
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Successfully checked out', { description: "Your shift has been completed." });
    },
    onError: (error) => {
      toast.error('Check-out failed', { description: getErrorMessage(error, 'Unable to clock out.') });
    }
  });
};

export const useExportAttendanceCsv = () => {
  return useMutation({
    mutationFn: async (filters) => {
      const response = await exportAttendanceCsv(filters);
      return response.data;
    },
    onSuccess: (blob) => {
      const fileBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'text/csv;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      const exportDate = new Date().toISOString().slice(0, 10);

      link.href = downloadUrl;
      link.download = `attendance-export-${exportDate}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      toast.success('Attendance export ready', {
        description: 'The CSV file has been downloaded successfully.',
      });
    },
    onError: (error) => {
      toast.error('Attendance export failed', {
        description: getErrorMessage(error, 'Unable to export attendance right now.'),
      });
    },
  });
};
