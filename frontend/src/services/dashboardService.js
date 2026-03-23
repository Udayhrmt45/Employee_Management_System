import api from './api';

export const getDashboardSummary = async () => {
  return api.get('/dashboard/summary');
};
