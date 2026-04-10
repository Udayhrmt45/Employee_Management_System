/**
 * Alter Salary Migration
 * Adds effective_from to salary_structures and deductions to salary_slips.
 * Run: node src/models/runAlterSalary.js
 */

const { getDatabase, connectDatabase } = require("../config/database");
const logger = require("../utils/logger");

const ALTER_SQL = `
  ALTER TABLE salary_structures 
  ADD COLUMN IF NOT EXISTS effective_from DATE DEFAULT CURRENT_DATE;

  ALTER TABLE salary_slips 
  ADD COLUMN IF NOT EXISTS deductions NUMERIC(12,2) NOT NULL DEFAULT 0;
`;

async function runMigration() {
  try {
    await connectDatabase();
    const db = getDatabase();
    await db.query(ALTER_SQL);
    logger.info("✅  Salary Alter migration completed successfully");
  } catch (error) {
    logger.error("❌  Salary Alter migration failed", { message: error.message });
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigration();
