/**
 * Alter Salary Slip Migration
 * Adds working_days and total_days to salary_slips.
 * Run: node src/models/runAlterSalarySlipDates.js
 */

const { getDatabase, connectDatabase } = require("../config/database");
const logger = require("../utils/logger");

const ALTER_SQL = `
  ALTER TABLE salary_slips 
  ADD COLUMN IF NOT EXISTS working_days INTEGER NOT NULL DEFAULT 0;

  ALTER TABLE salary_slips 
  ADD COLUMN IF NOT EXISTS total_days INTEGER NOT NULL DEFAULT 30;
`;

async function runMigration() {
  try {
    await connectDatabase();
    const db = getDatabase();
    await db.query(ALTER_SQL);
    logger.info("✅ Salary Slip Alter migration for working_days and total_days completed successfully");
  } catch (error) {
    logger.error("❌ Salary Slip Alter migration failed", { message: error.message });
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigration();
