const adminDemoModel = require("../../models/admin/adminDemoModel");

exports.getAllDemoRequests = async (status) => {
  return await adminDemoModel.getAllDemoRequests(status);
};

exports.getDemoRequestById = async (id) => {
  const request = await adminDemoModel.getDemoRequestById(id);
  if (!request) {
    const error = new Error("Demo request not found");
    error.statusCode = 404;
    throw error;
  }
  return request;
};

exports.updateDemoStatus = async (id, status) => {
  const validStatuses = ['NEW', 'CONTACTED', 'SCHEDULED', 'CLOSED'];
  if (!validStatuses.includes(status)) {
     const error = new Error("Invalid status type");
     error.statusCode = 400;
     throw error;
  }
  const request = await adminDemoModel.updateDemoStatus(id, status);
  if (!request) {
    const error = new Error("Demo request not found");
    error.statusCode = 404;
    throw error;
  }
  return request;
};

exports.updateDemoNotes = async (id, notes) => {
  const request = await adminDemoModel.updateDemoNotes(id, notes);
  if (!request) {
    const error = new Error("Demo request not found");
    error.statusCode = 404;
    throw error;
  }
  return request;
};

exports.deleteDemoRequest = async (id) => {
  const deleted = await adminDemoModel.deleteDemoRequest(id);
  if (!deleted) {
    const error = new Error("Demo request not found");
    error.statusCode = 404;
    throw error;
  }
  return deleted;
};
