/**
 * Salary Migration
 * Creates salary_structures and salary_slips tables.
 * Run: node src/models/salaryMigration.js
 */

const { getDatabase, connectDatabase } = require("../config/database");
const logger = require("../utils/logger");

const MIGRATION_SQL = `
  -- Salary structures (one per employee per company)
  CREATE TABLE IF NOT EXISTS salary_structures (
    id             BIGSERIAL PRIMARY KEY,
    company_id     BIGINT       NOT NULL,
    employee_id    BIGINT       NOT NULL,
    basic_salary   NUMERIC(12,2) NOT NULL DEFAULT 0,
    hra            NUMERIC(12,2) NOT NULL DEFAULT 0,
    allowances     NUMERIC(12,2) NOT NULL DEFAULT 0,
    deductions     NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_salary_structure UNIQUE (company_id, employee_id)
  );

  CREATE INDEX IF NOT EXISTS idx_salary_structures_company
    ON salary_structures (company_id);

  CREATE INDEX IF NOT EXISTS idx_salary_structures_employee
    ON salary_structures (employee_id);

  -- Salary slips (one per employee per month/year)
  CREATE TABLE IF NOT EXISTS salary_slips (
    id               BIGSERIAL PRIMARY KEY,
    company_id       BIGINT       NOT NULL,
    employee_id      BIGINT       NOT NULL,
    month            SMALLINT     NOT NULL CHECK (month BETWEEN 1 AND 12),
    year             SMALLINT     NOT NULL CHECK (year BETWEEN 2000 AND 2100),
    total_earnings   NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_salary       NUMERIC(12,2) NOT NULL DEFAULT 0,
    basic_salary     NUMERIC(12,2) NOT NULL DEFAULT 0,
    hra              NUMERIC(12,2) NOT NULL DEFAULT 0,
    allowances       NUMERIC(12,2) NOT NULL DEFAULT 0,
    generated_by     BIGINT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_salary_slip UNIQUE (company_id, employee_id, month, year)
  );

  CREATE INDEX IF NOT EXISTS idx_salary_slips_company
    ON salary_slips (company_id);

  CREATE INDEX IF NOT EXISTS idx_salary_slips_employee
    ON salary_slips (employee_id);

  CREATE INDEX IF NOT EXISTS idx_salary_slips_month_year
    ON salary_slips (company_id, year, month);
`;

async function runMigration() {
  try {
    await connectDatabase();
    const db = getDatabase();
    await db.query(MIGRATION_SQL);
    logger.info("✅  Salary migration completed successfully");
  } catch (error) {
    logger.error("❌  Salary migration failed", { message: error.message });
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigration();
