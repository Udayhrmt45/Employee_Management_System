const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // Ensure exact dotenv resolving

const { connectDatabase, getDatabase } = require('./config/database');
const fs = require('fs');

async function run() {
  try {
    await connectDatabase();
    const db = getDatabase();
    
    console.log("Running demo_migration.sql...");
    const demoSql = fs.readFileSync(path.join(__dirname, 'models', 'demo_migration.sql'), 'utf8');
    await db.query(demoSql);
    
    console.log("Running alter_demo_migration.sql...");
    const alterSql = fs.readFileSync(path.join(__dirname, 'models', 'alter_demo_migration.sql'), 'utf8');
    await db.query(alterSql);
    
    console.log("Migrations applied successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
