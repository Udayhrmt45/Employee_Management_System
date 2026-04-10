import api from './api';

// ─── Salary Structure ─────────────────────────────────────────────────────────

export const setSalaryStructure = async (data) =>
  api.post('/salary/structure', data);

export const getSalaryStructure = async (employeeId) =>
  api.get(`/salary/structure/${employeeId}`);

// ─── Salary Slips ─────────────────────────────────────────────────────────────

export const generateSalarySlip = async (data) =>
  api.post('/salary/generate', data);

export const getSalarySlips = async (params = {}) =>
  api.get('/salary/slips', { params });

export const getSalarySlipById = async (id) =>
  api.get(`/salary/slips/${id}`);

/**
 * Download a salary slip PDF as a Blob.
 * Returns a Blob that can be used to trigger a browser download.
 */
export const downloadSalarySlipPdf = async (id) =>
  api.get(`/salary/slips/${id}/pdf`, { responseType: 'blob' });
