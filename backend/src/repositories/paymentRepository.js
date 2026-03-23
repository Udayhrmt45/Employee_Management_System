const { getDatabase } = require("../config/database");

exports.findCompanyById = async (companyId, client = getDatabase()) => {
  const { rows } = await client.query(
    `SELECT id, name, plan_type, razorpay_customer_id, created_at, updated_at
     FROM companies
     WHERE id = $1
     LIMIT 1`,
    [companyId]
  );

  return rows[0] || null;
};

exports.updateCompanyPlan = async (companyId, planType, client = getDatabase()) => {
  await client.query(
    `UPDATE companies
     SET plan_type = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [planType, companyId]
  );
};

exports.createPaymentRecord = async (payload, client = getDatabase()) => {
  const { rows } = await client.query(
    `INSERT INTO payments
      (company_id, razorpay_payment_id, amount, currency, plan, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, company_id, razorpay_payment_id, amount, currency, plan, status, created_at`,
    [
      payload.companyId,
      payload.razorpayPaymentId,
      payload.amount,
      payload.currency,
      payload.plan,
      payload.status
    ]
  );

  return rows[0];
};

exports.findLatestPaymentByCompanyId = async (companyId, client = getDatabase()) => {
  const { rows } = await client.query(
    `SELECT id, razorpay_payment_id, amount, currency, plan, status, created_at
     FROM payments
     WHERE company_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [companyId]
  );

  return rows[0] || null;
};
