import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCompanySettings,
  getTeamMembers,
  inviteTeamMember,
  removeTeamMember,
  updateCompanySettings,
  deleteCompanySettings,
  getManagedDepartments,
  createManagedDepartment,
  updateManagedDepartment,
  deleteManagedDepartment,
} from '@/services/settingsService';
import { getSubscription, createPaymentOrder, verifyPayment } from '@/services/paymentService';
import { getApiData, getErrorMessage } from '@/utils/normalizers';
import { useClerk } from '@clerk/clerk-react';
import { toast } from 'sonner';

export function useCompanySettings() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['settings-company'],
    queryFn: async () => {
      const response = await getCompanySettings();
      return getApiData(response, null);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    companySettings: data,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load company settings.'),
    refetch,
  };
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompanySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-company'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      toast.success('Settings saved', {
        description: 'Company profile has been updated successfully.',
      });
    },
    onError: (error) => {
      toast.error('Unable to save settings', {
        description: getErrorMessage(error, 'Please try again in a moment.'),
      });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  const { signOut } = useClerk();

  return useMutation({
    mutationFn: deleteCompanySettings,
    onSuccess: async () => {
      queryClient.clear();
      toast.success('Workspace deleted', {
        description: 'Your workspace and account have been permanently deleted.',
      });
      await signOut();
    },
    onError: (error) => {
      toast.error('Failed to delete workspace', {
        description: getErrorMessage(error, 'Please try again in a moment or contact support.'),
      });
    },
  });
}

export function useTeamMembers() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['settings-members'],
    queryFn: async () => {
      const response = await getTeamMembers();
      return getApiData(response, { activeMembers: [], pendingInvitations: [] });
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    activeMembers: data?.activeMembers || [],
    pendingInvitations: data?.pendingInvitations || [],
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load team members.'),
    refetch,
  };
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings-members'] });
      toast.success('Invite sent', {
        description: `An invitation has been sent to ${variables.email}.`,
      });
    },
    onError: (error) => {
      toast.error('Failed to send invite', {
        description: getErrorMessage(error, 'Please try again in a moment.'),
      });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeTeamMember,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings-members'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      const action = variables.kind === 'invitation' ? 'Invitation revoked' : 'Member removed';
      toast.success(action, {
        description: variables.kind === 'invitation'
          ? 'The pending invitation has been revoked.'
          : 'The team member has been removed.',
      });
    },
    onError: (error) => {
      toast.error('Unable to remove member', {
        description: getErrorMessage(error, 'Please try again in a moment.'),
      });
    },
  });
}

export function useSubscription() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await getSubscription();
      return getApiData(response, null);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    subscription: data,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load subscription information.'),
    refetch,
  };
}

export function useManagedDepartments() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['managed-departments'],
    queryFn: async () => {
      const response = await getManagedDepartments();
      return getApiData(response, []);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    departments: Array.isArray(data) ? data : [],
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load departments.'),
    refetch,
  };
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createManagedDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Department created', {
        description: 'The department has been added successfully.',
      });
    },
    onError: (error) => {
      toast.error('Unable to create department', {
        description: getErrorMessage(error, 'Please try again in a moment.'),
      });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateManagedDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Department renamed', {
        description: 'The department name has been updated.',
      });
    },
    onError: (error) => {
      toast.error('Unable to rename department', {
        description: getErrorMessage(error, 'Please try again in a moment.'),
      });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteManagedDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Department deleted', {
        description: 'The department has been removed successfully.',
      });
    },
    onError: (error) => {
      toast.error('Unable to delete department', {
        description: getErrorMessage(error, 'Please try again in a moment.'),
      });
    },
  });
}

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: createPaymentOrder,
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Payment verified', {
        description: 'Your subscription has been updated successfully.',
      });
    },
    onError: (error) => {
      toast.error('Payment verification failed', {
        description: getErrorMessage(error, 'Please contact support if the amount was charged.'),
      });
    },
  });
}
