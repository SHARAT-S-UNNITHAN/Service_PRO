// server/approve-all-providers.js
// ─────────────────────────────────────────────────────────────
// Run with: node approve-all-providers.js
// Approves ALL providers where is_verified = 0
// Use this after running seed.js to activate all seeded providers
// ─────────────────────────────────────────────────────────────

const sqlite3 = require("sqlite3").verbose();
const path    = require("path");

const db = new sqlite3.Database(path.join(__dirname, "app.db"));

db.serialize(() => {
  // Count pending first
  db.get(
    "SELECT COUNT(*) as count FROM providers WHERE is_verified = 0",
    (err, row) => {
      if (err) { console.error("Error:", err.message); return; }
      console.log(`\n📋 Found ${row.count} unapproved providers`);

      if (row.count === 0) {
        console.log("✅ All providers are already approved.");
        db.close();
        return;
      }

      // Approve all
      db.run(
        "UPDATE providers SET is_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE is_verified = 0",
        function (err) {
          if (err) {
            console.error("❌ Error approving providers:", err.message);
          } else {
            console.log(`✅ Successfully approved ${this.changes} providers!`);
            console.log("🔍 They will now appear in search results.");
          }
          db.close();
        }
      );
    }
  );
});