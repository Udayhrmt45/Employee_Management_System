const { getDatabase } = require("../../config/database");

exports.getAllPayments = async (filters = {}) => {
  const db = getDatabase();
  let query = `
    SELECT 
      p.id, p.company_id, c.name AS company_name, p.razorpay_payment_id, 
      p.amount, p.currency, p.plan, p.status, p.created_at
    FROM payments p
    LEFT JOIN companies c ON p.company_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.companyId) {
    params.push(filters.companyId);
    query += ` AND p.company_id = $${params.length}`;
  }
  if (filters.plan) {
    params.push(filters.plan);
    query += ` AND p.plan = $${params.length}`;
  }
  if (filters.status) {
    params.push(filters.status);
    query += ` AND p.status = $${params.length}`;
  }

  query += ` ORDER BY p.created_at DESC`;

  const { rows } = await db.query(query, params);
  return rows;
};
