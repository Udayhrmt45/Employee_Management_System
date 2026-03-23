const { getDatabase } = require("../../config/database");

exports.getGlobalStats = async () => {
  const db = getDatabase();

  const companiesQuery = `SELECT COUNT(*) AS total_companies FROM companies`;
  const activeSubsQuery = `
    SELECT COUNT(*) AS active_subscriptions 
    FROM companies 
    WHERE plan_type != 'FREE' AND is_active = true
  `;
  const usersQuery = `SELECT COUNT(*) AS total_users FROM users`;
  const revenueQuery = `
    SELECT SUM(amount) AS total_revenue 
    FROM payments 
    WHERE status = 'PAID'
  `;

  const [companies, activeSubs, users, revenue] = await Promise.all([
    db.query(companiesQuery),
    db.query(activeSubsQuery),
    db.query(usersQuery),
    db.query(revenueQuery),
  ]);

  return {
    totalCompanies: parseInt(companies.rows[0].total_companies, 10),
    activeSubscriptions: parseInt(activeSubs.rows[0].active_subscriptions, 10),
    totalUsers: parseInt(users.rows[0].total_users, 10),
    monthlyRevenue: parseFloat(revenue.rows[0].total_revenue || 0), // Note: amount is in paise/cents, need logic if needed. Assuming stored normally or needs division
  };
};
