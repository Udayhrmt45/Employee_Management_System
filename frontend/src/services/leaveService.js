import api from './api';

export const applyLeave = async (leaveData) => {
  return api.post('/leaves/apply', leaveData);
};

export const getLeaveTypes = async () => {
  return api.get('/leaves/types');
};

export const getLeaveBalances = async () => {
  return api.get('/leaves/balance');
};

export const getLeaves = async () => {
  return api.get('/leaves/my');
};

export const getTeamLeaves = async () => {
  return api.get('/leaves/team');
};

export const approveLeave = async (leaveId) => {
  return api.put(`/leaves/${leaveId}/approve`, {});
};

export const rejectLeave = async (leaveId) => {
  return api.put(`/leaves/${leaveId}/reject`, {});
};
