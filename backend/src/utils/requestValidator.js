const ApiError = require("./ApiError");

function validateRequest(schema, payload) {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    throw new ApiError(
      422,
      "Validation failed",
      error.details.map((detail) => ({
        path: detail.path.join("."),
        message: detail.message
      }))
    );
  }

  return value;
}

module.exports = validateRequest;
