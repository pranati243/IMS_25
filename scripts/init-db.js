import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load environment variables from .env.local first, then fall back to .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Log the environment variables we're using (without showing password)
console.log("Environment variables:");
console.log(`- MYSQL_HOST: ${process.env.MYSQL_HOST || "localhost"}`);
console.log(`- MYSQL_USER: ${process.env.MYSQL_USER || "root"}`);
console.log(`- MYSQL_DATABASE: ${process.env.MYSQL_DATABASE || "ims2025"}`);
console.log(`- Password: ${process.env.MYSQL_PASSWORD ? "******" : "not set"}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "ims2025",
  multipleStatements: true,
};

// SQL files to execute in order
const sqlFiles = [
  path.join(__dirname, "../app/lib/create_tables.sql"),
  path.join(__dirname, "../app/lib/insert_data.sql"),
  path.join(__dirname, "../app/lib/auth-tables.sql"),
  path.join(__dirname, "../app/lib/seed-auth.sql"),
];

// Verify all SQL files exist
console.log("Checking SQL files...");
for (const file of sqlFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ Found SQL file: ${path.basename(file)}`);
  } else {
    console.error(`❌ Missing SQL file: ${path.basename(file)}`);
    process.exit(1);
  }
}

async function initializeDatabase() {
  let connection;

  try {
    // Create connection
    console.log("Connecting to database...");

    try {
      connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        multipleStatements: true,
      });
      console.log("✅ Connection successful!");
    } catch (err) {
      console.error("❌ Failed to connect to MySQL server:", err.message);
      console.log(
        "Please check your MySQL server is running and credentials are correct."
      );
      console.log(
        "You may need to create a .env.local file with your database credentials."
      );
      process.exit(1);
    }

    // Create database if it doesn't exist
    console.log(
      `Creating database ${dbConfig.database} if it doesn't exist...`
    );
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`
    );

    // Use the database
    console.log(`Using database ${dbConfig.database}...`);
    await connection.query(`USE ${dbConfig.database}`);

    // Execute each SQL file
    for (const sqlFile of sqlFiles) {
      console.log(`Executing SQL file: ${path.basename(sqlFile)}`);
      const sql = fs.readFileSync(sqlFile, "utf8");
      try {
        await connection.query(sql);
        console.log(`✅ Successfully executed ${path.basename(sqlFile)}`);
      } catch (err) {
        console.error(
          `❌ Error executing ${path.basename(sqlFile)}:`,
          err.message
        );
        throw err;
      }
    }

    // Verify tables were created
    try {
      const [rows] = await connection.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = '${dbConfig.database}'
      `);

      console.log("\nVerifying database tables:");
      if (Array.isArray(rows) && rows.length > 0) {
        rows.forEach((row) => {
          console.log(`✅ Table created: ${row.TABLE_NAME || row.table_name}`);
        });
      } else {
        console.log("❌ No tables found in database");
      }
    } catch (err) {
      console.error("❌ Failed to verify tables:", err.message);
    }

    console.log("\nDatabase initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// Run the initialization
initializeDatabase();
