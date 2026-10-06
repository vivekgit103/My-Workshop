require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// To run this, you need the Supabase connection string for your database (PostgreSQL URI)
// E.g., postgresql://postgres.[project-ref]:[db-password]@aws-0-[region].pooler.supabase.com:6543/postgres

async function migrate() {
  const connectionString = process.env.SUPABASE_DB_URL;
  
  if (!connectionString) {
    console.error("❌ ERROR: SUPABASE_DB_URL environment variable is not defined.");
    console.error("Please add it to your .env file or export it.");
    console.error("Note: DDL (schema creation) requires a direct database connection, not just the REST API service role key.");
    process.exit(1);
  }

  const client = new Client({
    connectionString: connectionString,
  });

  try {
    console.log("Connecting to Supabase Database...");
    await client.connect();
    console.log("✅ Connected successfully.");

    const schemaPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    console.log(`Reading schema file from: ${schemaPath}`);
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log("Executing schema SQL...");
    await client.query(schemaSql);
    
    console.log("✅ Initial schema migrated successfully!");
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

migrate();
