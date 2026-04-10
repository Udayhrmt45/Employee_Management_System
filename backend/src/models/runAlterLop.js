/**
 * Alter LOP Migration
 * Adds type to leave_types, lop_days and payable_days to salary_slips.
 * Run: node src/models/runAlterLop.js
 */

const { getDatabase, connectDatabase } = require("../config/database");
const logger = require("../utils/logger");

const ALTER_SQL = `
  -- Add category to leave types
  ALTER TABLE leave_types 
  ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'PAID';

  -- Update any existing "Unpaid Leave" to the UNPAID type.
  UPDATE leave_types SET type = 'UNPAID' WHERE name ILIKE '%unpaid%';

  -- Track LOP and Payable days in payslips
  ALTER TABLE salary_slips
  ADD COLUMN IF NOT EXISTS lop_days INTEGER NOT NULL DEFAULT 0;

  ALTER TABLE salary_slips
  ADD COLUMN IF NOT EXISTS payable_days INTEGER NOT NULL DEFAULT 0;
`;

async function runMigration() {
  try {
    await connectDatabase();
    const db = getDatabase();
    await db.query(ALTER_SQL);
    logger.info("✅ LOP Alter migration completed successfully");
  } catch (error) {
    logger.error("❌ LOP Alter migration failed", { message: error.message });
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigration();
