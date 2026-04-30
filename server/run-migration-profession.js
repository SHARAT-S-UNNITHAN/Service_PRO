// server/run-migration-profession.js
// Run: node run-migration-profession.js
const sqlite3 = require("sqlite3").verbose();
const path    = require("path");

const db = new sqlite3.Database(path.join(__dirname, "app.db"));

db.run(
  "ALTER TABLE bookings ADD COLUMN profession TEXT DEFAULT NULL",
  (err) => {
    if (err) {
      if (err.message.includes("duplicate column")) {
        console.log("⏭  Column 'profession' already exists — nothing to do.");
      } else {
        console.error("❌ Migration failed:", err.message);
      }
    } else {
      console.log("✅ Added column: profession to bookings table");
    }
    db.close();
  }
);