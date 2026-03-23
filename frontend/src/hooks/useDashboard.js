import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/services/dashboardService';
import { getApiData, getErrorMessage } from '@/utils/normalizers';

export function useDashboard() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await getDashboardSummary();
      const dashboardData = getApiData(response, {});

      return {
        summary: dashboardData.summary || null,
        recentActivity: Array.isArray(dashboardData.recentActivity)
          ? dashboardData.recentActivity
          : [],
      };
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  return {
    summary: data?.summary,
    recentActivity: data?.recentActivity || [],
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load dashboard data right now.'),
    refetch,
  };
}
