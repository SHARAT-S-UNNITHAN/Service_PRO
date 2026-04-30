// server/run-migration.js
// Run: node run-migration.js
const sqlite3 = require("sqlite3").verbose();
const path    = require("path");

const db = new sqlite3.Database(path.join(__dirname, "app.db"));

const migrations = [
  // bookings table additions
  "ALTER TABLE bookings ADD COLUMN cash_amount_paid DECIMAL(10,2) DEFAULT NULL",
  "ALTER TABLE bookings ADD COLUMN customer_confirmed INTEGER DEFAULT 0",
  "ALTER TABLE bookings ADD COLUMN customer_confirmed_at DATETIME DEFAULT NULL",
  // providers table additions
  "ALTER TABLE providers ADD COLUMN trust_score INTEGER DEFAULT 100",
  "ALTER TABLE providers ADD COLUMN total_earnings DECIMAL(10,2) DEFAULT 0",
];

console.log("🔄 Running migrations...\n");

let completed = 0;
migrations.forEach((sql) => {
  db.run(sql, (err) => {
    if (err) {
      // "duplicate column" means already ran — safe to ignore
      if (err.message.includes("duplicate column")) {
        console.log(`⏭  Already exists: ${sql.split("ADD COLUMN")[1]?.trim().split(" ")[0]}`);
      } else {
        console.error(`❌ Failed: ${err.message}`);
      }
    } else {
      const col = sql.split("ADD COLUMN")[1]?.trim().split(" ")[0];
      console.log(`✅ Added column: ${col}`);
    }
    completed++;
    if (completed === migrations.length) {
      console.log("\n✅ Migration complete!");
      db.close();
    }
  });
});