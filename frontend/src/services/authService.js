import api from './api';

export const bootstrapWorkspace = async (payload) => {
  return api.post('/auth/bootstrap', payload);
};

export const inviteEmployees = async (payload) => {
  return api.post('/auth/invite', payload);
};

export const getCurrentUser = async () => {
  return api.get('/auth/me');
};
