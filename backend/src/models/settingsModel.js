const { getDatabase } = require("../config/database");

exports.getAllSettings = async () => {
  const db = getDatabase();
  const query = `SELECT key, value FROM settings ORDER BY key ASC`;
  const { rows } = await db.query(query);
  const settings = {};
  rows.forEach(row => {
    settings[row.key] = row.value;
  });
  return settings;
};

exports.updateSettings = async (settingsPayload) => {
  const db = getDatabase();
  const keys = Object.keys(settingsPayload);
  const updatedSettings = {};
  
  for (const key of keys) {
    const value = settingsPayload[key];
    const query = `
      INSERT INTO settings (key, value, updated_at) 
      VALUES ($1, $2, NOW()) 
      ON CONFLICT (key) 
      DO UPDATE SET value = $2, updated_at = NOW() 
      RETURNING key, value
    `;
    const { rows } = await db.query(query, [key, JSON.stringify(value)]);
    updatedSettings[rows[0].key] = rows[0].value;
  }
  
  return updatedSettings;
};
