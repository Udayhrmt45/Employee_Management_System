import api from './api';

export const getHolidays = async (params) =>
  api.get('/holidays', { params });

export const createHoliday = async (data) =>
  api.post('/holidays', data);

export const deleteHoliday = async (id) =>
  api.delete(`/holidays/${id}`);
