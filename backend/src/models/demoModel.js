const { getDatabase } = require("../config/database");

exports.createDemoRequest = async (demoData) => {
  const db = getDatabase();
  const query = `
    INSERT INTO demo_requests (name, email, company_name, team_size, message)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [
    demoData.name,
    demoData.email,
    demoData.company_name,
    demoData.team_size,
    demoData.message || null
  ];
  
  const { rows } = await db.query(query, values);
  return rows[0];
};
