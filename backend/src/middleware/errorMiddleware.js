const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

function mapJoiError(error) {
  return new ApiError(
    422,
    "Validation failed",
    error.details.map((detail) => ({
      path: detail.path.join("."),
      message: detail.message
    }))
  );
}

function mapDatabaseError(error) {
  switch (error.code) {
    case "23505":
      return new ApiError(409, "Duplicate resource");
    case "23503":
      return new ApiError(400, "Related resource does not exist");
    case "22P02":
      return new ApiError(400, "Invalid database input");
    default:
      return null;
  }
}

function normalizeError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error?.isJoi) {
    return mapJoiError(error);
  }

  const databaseError = mapDatabaseError(error);

  if (databaseError) {
    return databaseError;
  }

  return new ApiError(error.statusCode || 500, error.message || "Internal server error");
}

module.exports = (error, req, res, next) => {
  const normalizedError = normalizeError(error);
  const logPayload = {
    method: req.method,
    path: req.originalUrl,
    statusCode: normalizedError.statusCode,
    errors: normalizedError.errors || null,
    stack: error.stack
  };

  if (normalizedError.statusCode >= 500) {
    logger.error(normalizedError.message, logPayload);
  } else {
    logger.warn(normalizedError.message, logPayload);
  }

  res.status(normalizedError.statusCode).json({
    success: false,
    message: normalizedError.message,
    errors: normalizedError.errors || null,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
};
