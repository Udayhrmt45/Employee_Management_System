const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const env = require("./config/env");
const routes = require("./routes");
const rateLimiter = require("./middleware/rateLimiter");
const notFound = require("./middleware/notFound");
const errorMiddleware = require("./middleware/errorMiddleware");
const logger = require("./utils/logger");
const { initializeClerk } = require("./config/clerk");

const app = express();

app.use(initializeClerk());
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(
  express.json({
    limit: "1mb",
    verify: (req, res, buffer) => {
      req.rawBody = buffer.toString("utf8");
    }
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan(env.nodeEnv === "production" ? "combined" : "dev", {
    stream: logger.stream
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: `${env.appName} is running`,
    environment: env.nodeEnv
  });
});

app.use(env.apiPrefix, rateLimiter, routes);
app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
