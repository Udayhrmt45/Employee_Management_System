const companyRepository = require("../../repositories/admin/companyRepository");
const ApiError = require("../../utils/ApiError");

exports.getAllCompanies = async () => {
  return await companyRepository.getAllCompanies();
};

exports.getCompanyDetails = async (companyId) => {
  const company = await companyRepository.getCompanyById(companyId);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }
  return company;
};

exports.activateCompany = async (companyId) => {
  const company = await companyRepository.updateCompanyStatus(companyId, true);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }
  return company;
};

exports.deactivateCompany = async (companyId) => {
  const company = await companyRepository.updateCompanyStatus(companyId, false);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }
  return company;
};
