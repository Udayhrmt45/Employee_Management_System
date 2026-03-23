const paymentService = require("../../services/admin/paymentService");

exports.getPayments = async (req, res) => {
  const { plan, status } = req.query;
  const payments = await paymentService.getAllPayments({ plan, status });
  res.status(200).json({ success: true, data: payments });
};

exports.getPaymentsByCompany = async (req, res) => {
  const { companyId } = req.params;
  const payments = await paymentService.getAllPayments({ companyId });
  res.status(200).json({ success: true, data: payments });
};
