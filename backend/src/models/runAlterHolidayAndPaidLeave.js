/**
 * Adds holiday calendar, employee paid leave balance, leave request split fields,
 * and expanded salary slip summary fields.
 * Run: node src/models/runAlterHolidayAndPaidLeave.js
 */

const { getDatabase, connectDatabase } = require("../config/database");
const logger = require("../utils/logger");

const ALTER_SQL = `
  ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS paid_leave_balance INTEGER NOT NULL DEFAULT 0;

  CREATE TABLE IF NOT EXISTS holidays (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_holidays_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT uq_holidays_company_date UNIQUE (company_id, date)
  );

  CREATE INDEX IF NOT EXISTS idx_holidays_company_date ON holidays(company_id, date);

  ALTER TABLE leave_requests
  ADD COLUMN IF NOT EXISTS effective_days INTEGER NOT NULL DEFAULT 0;

  ALTER TABLE leave_requests
  ADD COLUMN IF NOT EXISTS paid_days INTEGER NOT NULL DEFAULT 0;

  ALTER TABLE leave_requests
  ADD COLUMN IF NOT EXISTS unpaid_days INTEGER NOT NULL DEFAULT 0;

  ALTER TABLE salary_slips
  ADD COLUMN IF NOT EXISTS holiday_count INTEGER NOT NULL DEFAULT 0;

  ALTER TABLE salary_slips
  ADD COLUMN IF NOT EXISTS paid_leave_days INTEGER NOT NULL DEFAULT 0;
`;

async function runMigration() {
  try {
    await connectDatabase();
    const db = getDatabase();
    await db.query(ALTER_SQL);
    logger.info("Holiday and paid leave migration completed successfully");
  } catch (error) {
    logger.error("Holiday and paid leave migration failed", { message: error.message });
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigration();
