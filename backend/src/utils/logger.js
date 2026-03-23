const fs = require("fs");
const path = require("path");
const winston = require("winston");

const env = require("../config/env");

const logDir = path.join(process.cwd(), "logs");
fs.mkdirSync(logDir, { recursive: true });

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metadata = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${stack || message}${metadata}`;
  })
);

const transports = [
  new winston.transports.File({
    filename: path.join(logDir, "error.log"),
    level: "error"
  }),
  new winston.transports.File({
    filename: path.join(logDir, "combined.log")
  })
];

if (env.nodeEnv !== "production") {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

const logger = winston.createLogger({
  level: env.nodeEnv === "production" ? "info" : "debug",
  format: fileFormat,
  defaultMeta: {
    service: env.appName
  },
  transports
});

logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

module.exports = logger;
