const { getAuthenticatedUserId } = require("../config/clerk");
const authService = require("../services/authService");
const ApiError = require("../utils/ApiError");

module.exports = async (req, res, next) => {
  try {
    const { auth, userId } = getAuthenticatedUserId(req);

    if (!userId) {
      throw new ApiError(401, "Unauthorized: invalid or missing Clerk session");
    }

    const { user } = await authService.ensureWorkspaceForClerkUser(userId);

    req.auth = auth;
    req.user = user;

    return next();
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(401, "Unauthorized"));
  }
};
