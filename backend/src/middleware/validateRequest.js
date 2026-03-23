const validateInput = require("../utils/requestValidator");

module.exports = (schema, source = "body") => (req, res, next) => {
  try {
    req[source] = validateInput(schema, req[source]);
    return next();
  } catch (error) {
    return next(error);
  }
};
