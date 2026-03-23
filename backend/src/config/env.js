const dotenv = require("dotenv");

dotenv.config();

const required = [
  "NODE_ENV",
  "PORT",
  "APP_NAME",
  "API_PREFIX",
  "POSTGRES_HOST",
  "POSTGRES_PORT",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "POSTGRES_DATABASE",
  "REDIS_HOST",
  "REDIS_PORT",
  "CLERK_SECRET_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET"
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT || 4000),
  appName: process.env.APP_NAME,
  appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || 4000}`,
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  postgres: {
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    connectionLimit: Number(process.env.POSTGRES_CONNECTION_LIMIT || 10),
    ssl: process.env.POSTGRES_SSL === "true"
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB || 0)
  },
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 300)
  },
  attendance: {
    timezone: process.env.ATTENDANCE_TIMEZONE || "UTC",
    lateArrivalCutoff: process.env.ATTENDANCE_LATE_ARRIVAL_CUTOFF || "09:00:00",
  }
};
