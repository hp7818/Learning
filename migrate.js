import Database from "better-sqlite3";

// Connect to your existing database
const db = new Database("app.db");

console.log("🔄 Starting database migration reset...");

try {
  // 1. Temporarily disable foreign keys so SQLite doesn't complain during the drop process
  db.pragma("foreign_keys = OFF");

  // 2. Drop tables in order (child tables first, parent tables last)
  db.exec(`
    DROP TABLE IF EXISTS documents;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS roles;
  `);

  // 3. Re-enable foreign key constraints
  db.pragma("foreign_keys = ON");

  console.log("🗑️  All old tables successfully dropped.");
  console.log("✅ Ready for clean startup! Run your server to generate the updated tables.");

} catch (err) {
  console.error("❌ Migration failed with error:", err.message);
} finally {
  // Always close the database connection when finished
  db.close();
}