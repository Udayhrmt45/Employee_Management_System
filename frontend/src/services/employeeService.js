import api from './api';

export const getEmployees = async (params = {}) => {
  return await api.get('/employees', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
    },
  });
};

export const getEmployeeById = async (employeeId) => {
  return await api.get(`/employees/${employeeId}`);
};

export const getEmployeeLeaveBalances = async (employeeId) => {
  return await api.get(`/employees/${employeeId}/leave-balances`);
};

export const createEmployee = async (employeeData) => {
  return await api.post('/employees', employeeData);
};

export const updateEmployee = async ({ employeeId, employeeData }) => {
  return await api.put(`/employees/${employeeId}`, employeeData);
};

export const deleteEmployee = async (employeeId) => {
  return await api.delete(`/employees/${employeeId}`);
};

export const getDepartments = async () => {
  return await api.get('/employees/departments');
};
