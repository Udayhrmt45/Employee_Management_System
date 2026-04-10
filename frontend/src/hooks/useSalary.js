import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  setSalaryStructure,
  getSalaryStructure,
  generateSalarySlip,
  getSalarySlips,
  getSalarySlipById,
  downloadSalarySlipPdf,
} from '@/services/salaryService';
import { getApiData, getErrorMessage } from '@/utils/normalizers';

// ─── Salary Structure ─────────────────────────────────────────────────────────

export function useSalaryStructure(employeeId) {
  const {
    data: structure = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['salary-structure', employeeId],
    queryFn: async () => {
      const response = await getSalaryStructure(employeeId);
      return getApiData(response, null);
    },
    enabled: Boolean(employeeId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    structure,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load salary structure.'),
    refetch,
  };
}

export function useSetSalaryStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setSalaryStructure,
    onSuccess: (response) => {
      const data = getApiData(response, null);
      if (data?.employeeId) {
        queryClient.invalidateQueries({ queryKey: ['salary-structure', data.employeeId] });
      }
      queryClient.invalidateQueries({ queryKey: ['salary-slips'] });
      toast.success('Salary structure saved', {
        description: 'The salary structure has been updated successfully.',
      });
    },
    onError: (error) => {
      toast.error('Failed to save structure', {
        description: getErrorMessage(error, 'Could not save the salary structure.'),
      });
    },
  });
}

// ─── Salary Slips ─────────────────────────────────────────────────────────────

export function useSalarySlips(params = {}) {
  const {
    data: slips = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['salary-slips', params],
    queryFn: async () => {
      const response = await getSalarySlips(params);
      const data = getApiData(response);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });

  return {
    slips,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load salary slips.'),
    refetch,
  };
}

export function useSlipById(id) {
  const {
    data: slip = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['salary-slip', id],
    queryFn: async () => {
      const response = await getSalarySlipById(id);
      return getApiData(response, null);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    slip,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load salary slip.'),
  };
}

export function useGenerateSalarySlip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateSalarySlip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-slips'] });
      toast.success('Salary slip generated', {
        description: 'The salary slip has been created successfully.',
      });
    },
    onError: (error) => {
      toast.error('Generation failed', {
        description: getErrorMessage(error, 'Could not generate the salary slip.'),
      });
    },
  });
}

/**
 * Returns a handler function to trigger a PDF download for a given slip ID.
 */
export function useDownloadSlip() {
  return useMutation({
    mutationFn: async (id) => {
      const response = await downloadSalarySlipPdf(id);
      // response.data is a Blob when responseType: 'blob'
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `salary-slip-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Download started', {
        description: 'Your salary slip PDF is downloading.',
      });
    },
    onError: (error) => {
      toast.error('Download failed', {
        description: getErrorMessage(error, 'Could not download the salary slip.'),
      });
    },
  });
}
