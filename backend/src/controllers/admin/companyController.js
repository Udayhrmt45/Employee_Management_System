const companyService = require("../../services/admin/companyService");

exports.getCompanies = async (req, res) => {
  const companies = await companyService.getAllCompanies();
  res.status(200).json({ success: true, data: companies });
};

exports.getCompanyDetails = async (req, res) => {
  const { id } = req.params;
  const company = await companyService.getCompanyDetails(id);
  res.status(200).json({ success: true, data: company });
};

exports.activateCompany = async (req, res) => {
  const { id } = req.params;
  const company = await companyService.activateCompany(id);
  res.status(200).json({ success: true, message: "Company activated successfully", data: company });
};

exports.deactivateCompany = async (req, res) => {
  const { id } = req.params;
  const company = await companyService.deactivateCompany(id);
  res.status(200).json({ success: true, message: "Company deactivated successfully", data: company });
};
