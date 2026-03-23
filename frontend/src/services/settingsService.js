import api from './api';

export const getCompanySettings = async () => {
  return api.get('/settings/company');
};

export const updateCompanySettings = async (payload) => {
  return api.patch('/settings/company', payload);
};

export const deleteCompanySettings = async () => {
  return api.delete('/settings/company');
};

export const getTeamMembers = async () => {
  return api.get('/settings/members');
};

export const inviteTeamMember = async (payload) => {
  return api.post('/settings/members', payload);
};

export const removeTeamMember = async ({ memberId, kind }) => {
  return api.delete(`/settings/members/${memberId}`, {
    params: { kind },
  });
};

export const getManagedDepartments = async () => {
  return api.get('/departments');
};

export const createManagedDepartment = async (payload) => {
  return api.post('/departments', payload);
};

export const updateManagedDepartment = async ({ departmentId, payload }) => {
  return api.patch(`/departments/${departmentId}`, payload);
};

export const deleteManagedDepartment = async ({ departmentId, payload }) => {
  return api.delete(`/departments/${departmentId}`, {
    data: payload,
  });
};
