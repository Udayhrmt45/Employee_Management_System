const { getDatabase } = require("../../config/database");

exports.getAllDemoRequests = async (status, limit = 50, offset = 0) => {
  const db = getDatabase();
  let query = `SELECT * FROM demo_requests `;
  const values = [];

  if (status && status !== 'ALL') {
    query += `WHERE status = $1 `;
    values.push(status);
  }

  query += `ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, offset);

  const { rows } = await db.query(query, values);
  return rows;
};

exports.getDemoRequestById = async (id) => {
  const db = getDatabase();
  const query = `SELECT * FROM demo_requests WHERE id = $1`;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

exports.updateDemoStatus = async (id, status) => {
  const db = getDatabase();
  const query = `
    UPDATE demo_requests 
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 
    RETURNING *;
  `;
  const { rows } = await db.query(query, [status, id]);
  return rows[0];
};

exports.updateDemoNotes = async (id, notes) => {
  const db = getDatabase();
  const query = `
    UPDATE demo_requests 
    SET notes = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 
    RETURNING *;
  `;
  const { rows } = await db.query(query, [notes, id]);
  return rows[0];
};

exports.deleteDemoRequest = async (id) => {
  const db = getDatabase();
  const query = `DELETE FROM demo_requests WHERE id = $1 RETURNING id;`;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};
