const ApiError = require("../utils/ApiError");

module.exports = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Unauthorized: authentication is required before company scoping"));
  }

  if (req.user.role === "SUPER_ADMIN") {
    return next();
  }

  const companyId = req.user.company_id;

  if (!companyId) {
    return next(new ApiError(403, "Forbidden: authenticated user is not assigned to a company"));
  }

  req.companyId = companyId;

  return next();
};
