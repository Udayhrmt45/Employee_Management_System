const paymentRepository = require("../../repositories/admin/paymentRepository");

exports.getAllPayments = async (filters) => {
  return await paymentRepository.getAllPayments(filters);
};
