import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approveLeave, applyLeave, getLeaveBalances, getLeaveTypes, getLeaves, getTeamLeaves, rejectLeave } from '@/services/leaveService';
import { toast } from 'sonner';
import { getApiData, getErrorMessage, normalizeLeaveRecord } from '@/utils/normalizers';

const fetchLeaves = async (requestFn) => {
  const response = await requestFn();
  const leaves = getApiData(response);

  return Array.isArray(leaves)
    ? leaves.map(normalizeLeaveRecord)
    : [];
};

export function useLeaves() {
  const {
    data: leaves = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['leaves'],
    queryFn: () => fetchLeaves(getLeaves),
    staleTime: 1000 * 60 * 5, // 5 minutes caching
    refetchOnWindowFocus: true,
    retry: 1,
  });

  return {
    leaves,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load leave history.'),
    refetch,
  };
}

export function useLeaveTypes() {
  const {
    data: leaveTypes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['leave-types'],
    queryFn: async () => {
      const response = await getLeaveTypes();
      const types = getApiData(response);

      return Array.isArray(types) ? types : [];
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  return {
    leaveTypes,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load leave types right now.'),
    refetch,
  };
}

export function useLeaveBalances() {
  const {
    data: leaveBalances = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['leave-balances'],
    queryFn: async () => {
      const response = await getLeaveBalances();
      const balances = getApiData(response);

      return Array.isArray(balances) ? balances : [];
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    leaveBalances,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load leave balances right now.'),
    refetch,
  };
}

export function useTeamLeaves(enabled = true) {
  const {
    data: pendingLeaves = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['team-leaves'],
    queryFn: () => fetchLeaves(getTeamLeaves),
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return {
    pendingLeaves: pendingLeaves.filter((leave) => leave.rawStatus === 'PENDING'),
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load team leave approvals.'),
    refetch,
  };
}

export function useSubmitLeave() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: applyLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Leave request submitted', {
        description: 'Your leave application has been forwarded for approval.'
      });
    },
    onError: (error) => {
      toast.error('Failed to submit request', {
        description: getErrorMessage(error, 'There was an issue processing your leave application.')
      });
    }
  });
}

function useLeaveDecision(mutationFn, successTitle, successDescription, errorTitle) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success(successTitle, { description: successDescription });
    },
    onError: (error) => {
      toast.error(errorTitle, {
        description: getErrorMessage(error, 'Please try again in a moment.'),
      });
    },
  });
}

export function useApproveLeave() {
  return useLeaveDecision(
    approveLeave,
    'Leave approved',
    'The leave request has been approved successfully.',
    'Approval failed',
  );
}

export function useRejectLeave() {
  return useLeaveDecision(
    rejectLeave,
    'Leave rejected',
    'The leave request has been rejected successfully.',
    'Rejection failed',
  );
}
