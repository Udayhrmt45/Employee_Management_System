const { Pool, types } = require("pg");
const env = require("./env");
const logger = require("../utils/logger");

let pool;

async function connectDatabase() {
  types.setTypeParser(20, (value) => Number(value));
  types.setTypeParser(1082, (value) => value); // Preserve exact DATE string without local timezone parsing

  pool = new Pool({
    host: env.postgres.host,
    port: env.postgres.port,
    user: env.postgres.user,
    password: env.postgres.password,
    database: env.postgres.database,
    max: env.postgres.connectionLimit,
    idleTimeoutMillis: 30000,
    ssl: env.postgres.ssl ? { rejectUnauthorized: false } : undefined
  });

  const client = await pool.connect();
  await client.query("SELECT 1");
  client.release();
  logger.info("PostgreSQL connected");
}

function getDatabase() {
  if (!pool) {
    throw new Error("Database connection has not been initialized");
  }

  return pool;
}

module.exports = {
  connectDatabase,
  getDatabase
};
