import { useState, useDeferredValue } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, createEmployee, getDepartments, getEmployeeById, getEmployeeLeaveBalances, updateEmployee, deleteEmployee } from '@/services/employeeService';
import { toast } from 'sonner';
import { getApiData, getErrorMessage, normalizeEmployee } from '@/utils/normalizers';

const EMPLOYEE_PAGE_SIZE = 8;

export function useEmployees() {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'grid'
  const [page, setPage] = useState(1);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['employees', { page, limit: EMPLOYEE_PAGE_SIZE, search: deferredSearchQuery }],
    queryFn: async () => {
      const response = await getEmployees({
        page,
        limit: EMPLOYEE_PAGE_SIZE,
        search: deferredSearchQuery || undefined,
      });
      const employeesData = getApiData(response, {});
      const items = Array.isArray(employeesData?.items)
        ? employeesData.items.map(normalizeEmployee)
        : [];

      return {
        items,
        total: Number(employeesData?.total || 0),
        page: Number(employeesData?.page || page),
        limit: Number(employeesData?.limit || EMPLOYEE_PAGE_SIZE),
        totalPages: Number(employeesData?.totalPages || 1),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes caching
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const employees = data?.items || [];
  const totalEmployees = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const currentPage = Math.min(data?.page || page, totalPages);

  const updateSearchQuery = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const updateView = (nextView) => {
    setView(nextView);
    setPage(1);
  };

  return {
    view,
    setView: updateView,
    searchQuery,
    setSearchQuery: updateSearchQuery,
    page: currentPage,
    setPage,
    pageSize: EMPLOYEE_PAGE_SIZE,
    totalEmployees,
    totalPages,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load employees right now.'),
    refetch,
    employees,
  };
}

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee created successfully', {
        description: 'The new employee has been added to the directory.',
      });
    },
    onError: (error) => {
      toast.error('Failed to create employee', {
        description: getErrorMessage(error, 'An unexpected error occurred.'),
      });
    }
  });
};

export function useEmployeeDetails(employeeId, enabled = true) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      const response = await getEmployeeById(employeeId);
      const employeeData = getApiData(response, null);
      return employeeData ? normalizeEmployee(employeeData) : null;
    },
    enabled: Boolean(employeeId) && enabled,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    employee: data,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load employee details.'),
    refetch,
  };
}

export function useEmployeeLeaveBalances(employeeId, enabled = true) {
  const {
    data: leaveBalances = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['employee-leave-balances', employeeId],
    queryFn: async () => {
      const response = await getEmployeeLeaveBalances(employeeId);
      const leaveBalanceData = getApiData(response, []);
      return Array.isArray(leaveBalanceData) ? leaveBalanceData : [];
    },
    enabled: Boolean(employeeId) && enabled,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    leaveBalances,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load employee leave balances.'),
    refetch,
  };
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
      toast.success('Employee updated successfully', {
        description: 'The employee profile has been updated.',
      });
    },
    onError: (error) => {
      toast.error('Failed to update employee', {
        description: getErrorMessage(error, 'An unexpected error occurred.'),
      });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deleted successfully', {
        description: 'The employee record has been permanently removed.',
      });
    },
    onError: (error) => {
      toast.error('Failed to delete employee', {
        description: getErrorMessage(error, 'Unable to delete this employee right now.'),
      });
    },
  });
}

export function useDepartments() {
  const {
    data: departments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await getDepartments();
      const departmentData = getApiData(response);

      return Array.isArray(departmentData)
        ? departmentData
        : [];
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  return {
    departments,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load departments right now.'),
    refetch,
  };
}

export function useManagers() {
  const {
    data: managers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const response = await getEmployees({ limit: 100 });
      const employeesData = getApiData(response, {});
      const items = Array.isArray(employeesData?.items)
        ? employeesData.items.map(normalizeEmployee)
        : [];
      
      // Filter out regular employees to only show potential managers
      return items.filter(emp => emp.role === 'ADMIN' || emp.role === 'OWNER' || emp.role === 'SUPER_ADMIN');
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  return {
    managers,
    isLoading,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error, 'Unable to load managers right now.'),
    refetch,
  };
}
