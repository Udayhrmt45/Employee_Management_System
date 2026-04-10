const cron = require("node-cron");
const { getDatabase } = require("../config/database");
const payrollService = require("../services/payrollService");
const cacheHelper = require("../utils/cacheHelper");
const logger = require("../utils/logger");

/**
 * Runs monthly on the 1st day at 00:05.
 * Generates payslips for the previous month for all active employees 
 * who have a defined salary structure.
 */
function startSalaryCronJob() {
  logger.info("Initializing Salary Cron Job (Runs at 00:05 on the 1st of every month)");

  cron.schedule("5 0 1 * *", async () => {
    logger.info("Starting monthly auto-generation of salary slips...");
    try {
      const db = getDatabase();

      // Get previous month and year
      const now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth(); // 0-indexed, so getMonth() is naturally the previous month (1-12)
      if (month === 0) {
        month = 12;
        year -= 1;
      }

      // Query all distinct companies
      const companiesRes = await db.query("SELECT id FROM companies WHERE is_active = true");
      const companies = companiesRes.rows;

      for (const company of companies) {
        const companyId = company.id;

        // Query active employees with a salary structure
        const employeesRes = await db.query(
          `SELECT e.id AS employee_id, e.joining_date
           FROM employees e
           INNER JOIN salary_structures ss ON e.id = ss.employee_id
           WHERE e.company_id = $1 AND e.status = 'ACTIVE'`,
          [companyId]
        );

        let generatedCount = 0;
        let errorCount = 0;

        for (const record of employeesRes.rows) {
          try {
            await payrollService.generateSlipForPayroll(
              companyId,
              record.employee_id,
              { month, year, generatedBy: null }
            );
            generatedCount++;
          } catch (err) {
            if (err?.statusCode === 400 || err?.statusCode === 404 || err?.statusCode === 409) {
              continue;
            }

            if (err.code !== '23505') {
              logger.error(`Error generating slip for employee ${record.employee_id}`, { error: err.message });
              errorCount++;
            }
          }
        }

        if (generatedCount > 0) {
          logger.info(`Generated ${generatedCount} slips for company ${companyId}. (Errors: ${errorCount})`);
          await cacheHelper.invalidateNamespace(cacheHelper.CACHE_NAMESPACES.SALARY_SLIPS, companyId);
        }
      }

      logger.info("Monthly auto-generation completed.");
    } catch (globalError) {
      logger.error("Critical failure executing monthly salary cron job", { message: globalError.message });
    }
  });
}

module.exports = {
  startSalaryCronJob
};
