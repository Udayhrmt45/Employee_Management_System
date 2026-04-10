import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createHoliday, deleteHoliday, getHolidays } from '@/services/holidayService';
import { getApiData, getErrorMessage } from '@/utils/normalizers';

export function useHolidays(year) {
  const {
    data: holidays = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['holidays', year],
    queryFn: async () => {
      const response = await getHolidays({ year });
      const data = getApiData(response, []);
      return Array.isArray(data) ? data : [];
    },
    enabled: Boolean(year),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    holidays,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load holidays right now.'),
    refetch,
  };
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Holiday added', {
        description: 'The holiday calendar has been updated.',
      });
    },
    onError: (error) => {
      toast.error('Could not add holiday', {
        description: getErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Holiday removed', {
        description: 'The holiday was deleted from the calendar.',
      });
    },
    onError: (error) => {
      toast.error('Could not delete holiday', {
        description: getErrorMessage(error, 'Please try again.'),
      });
    },
  });
}
