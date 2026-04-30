// server/generate-credentials.js
// ─────────────────────────────────────────────────────────────
// Run with: node generate-credentials.js
// Reads existing data from database and creates credential file
// ─────────────────────────────────────────────────────────────

const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "app.db");
const CRED_FILE = path.join(__dirname, "seed_credentials.txt");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) { console.error("DB open error:", err.message); process.exit(1); }
  console.log("✅ Connected to app.db");
});

async function generateCredentials() {
  const credLines = [];
  
  credLines.push("=".repeat(80));
  credLines.push("  SMARTSERVICE + ZERV — SEED CREDENTIALS");
  credLines.push("  Generated: " + new Date().toLocaleString("en-IN"));
  credLines.push("  Password for ALL accounts: Password@123");
  credLines.push("=".repeat(80));

  // ── GET ALL USERS ──────────────────────────────────────────────
  credLines.push("\n" + "─".repeat(80));
  credLines.push("  USERS");
  credLines.push("─".repeat(80));
  credLines.push("  #   | Full Name                    | Email                                  | Phone");
  credLines.push("─".repeat(80));

  const users = await new Promise((resolve, reject) => {
    db.all(`
      SELECT u.id, u.email, c.full_name, c.phone 
      FROM users u 
      JOIN customers c ON u.id = c.user_id 
      WHERE u.role = 'user'
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  users.forEach((user, index) => {
    credLines.push(
      `  ${String(index + 1).padEnd(3)} | ${user.full_name.padEnd(28)} | ${user.email.padEnd(38)} | ${user.phone}`
    );
  });

  // ── GET ALL PROVIDERS (including @zerv.com) ───────────────────
  credLines.push("\n\n" + "─".repeat(80));
  credLines.push("  PROVIDERS (All)");
  credLines.push("  ⚠  Must be approved by admin before they appear in search.");
  credLines.push("─".repeat(80));
  credLines.push("  #    | Full Name                    | Email                                  | District        | Professions");
  credLines.push("─".repeat(80));

  const providers = await new Promise((resolve, reject) => {
    db.all(`
      SELECT p.id, p.full_name, u.email, p.district, 
             GROUP_CONCAT(pp.profession, ', ') as professions
      FROM providers p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN provider_professions pp ON p.id = pp.provider_id
      GROUP BY p.id
      ORDER BY p.id
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  providers.forEach((provider, index) => {
    const professions = provider.professions || "None";
    credLines.push(
      `  ${String(index + 1).padEnd(4)} | ${provider.full_name.padEnd(28)} | ${provider.email.padEnd(38)} | ${(provider.district || "Unknown").padEnd(15)} | ${professions.substring(0, 40)}`
    );
  });

  // ── STATISTICS ────────────────────────────────────────────────
  credLines.push("\n\n" + "─".repeat(80));
  credLines.push("  STATISTICS");
  credLines.push("─".repeat(80));
  
  const smartserviceCount = providers.filter(p => p.email.includes("@smartservice")).length;
  const zervCount = providers.filter(p => p.email.includes("@zerv")).length;
  
  credLines.push(`  Total Users: ${users.length}`);
  credLines.push(`  Total Providers: ${providers.length}`);
  credLines.push(`    - @smartservice.com: ${smartserviceCount}`);
  credLines.push(`    - @zerv.com: ${zervCount}`);
  
  // District wise breakdown
  credLines.push("\n  District-wise Provider Distribution:");
  const districtMap = {};
  providers.forEach(p => {
    const district = p.district || "Unknown";
    districtMap[district] = (districtMap[district] || 0) + 1;
  });
  
  Object.entries(districtMap).sort((a, b) => b[1] - a[1]).forEach(([district, count]) => {
    credLines.push(`    ${district.padEnd(20)} : ${count} providers`);
  });
  
  // Profession wise breakdown
  credLines.push("\n  Top Professions:");
  const professionMap = {};
  providers.forEach(p => {
    if (p.professions) {
      p.professions.split(', ').forEach(prof => {
        professionMap[prof] = (professionMap[prof] || 0) + 1;
      });
    }
  });
  
  Object.entries(professionMap).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([profession, count]) => {
    credLines.push(`    ${profession.padEnd(25)} : ${count} providers`);
  });

  // ── SAMPLE LOGINS ────────────────────────────────────────────
  credLines.push("\n\n" + "─".repeat(80));
  credLines.push("  SAMPLE LOGIN CREDENTIALS");
  credLines.push("─".repeat(80));
  credLines.push("  Password for ALL accounts: Password@123");
  credLines.push("");
  
  if (users.length > 0) {
    credLines.push("  Sample User:");
    credLines.push(`    Email: ${users[0].email}`);
    credLines.push(`    Password: Password@123`);
  }
  
  if (providers.length > 0) {
    credLines.push("\n  Sample Provider (SmartService):");
    const smartProvider = providers.find(p => p.email.includes("@smartservice"));
    if (smartProvider) {
      credLines.push(`    Email: ${smartProvider.email}`);
      credLines.push(`    Password: Password@123`);
    }
    
    credLines.push("\n  Sample Provider (Zerv):");
    const zervProvider = providers.find(p => p.email.includes("@zerv"));
    if (zervProvider) {
      credLines.push(`    Email: ${zervProvider.email}`);
      credLines.push(`    Password: Password@123`);
    }
  }

  credLines.push("\n\n" + "=".repeat(80));
  credLines.push("  HOW TO APPROVE PROVIDERS:");
  credLines.push("  1. Login as admin at http://localhost:3000/admin/dashboard");
  credLines.push("  2. Go to Providers section");
  credLines.push("  3. Click each provider and click Approve");
  credLines.push("  OR run: node approve-all-providers.js");
  credLines.push("=".repeat(80));

  // Write the file
  fs.writeFileSync(CRED_FILE, credLines.join("\n"), "utf8");
  
  console.log("\n✅ Credentials file generated successfully!");
  console.log(`📄 File saved to: ${CRED_FILE}`);
  console.log(`📊 Total Users: ${users.length}`);
  console.log(`📊 Total Providers: ${providers.length}`);
  console.log(`   - @smartservice.com: ${smartserviceCount}`);
  console.log(`   - @zerv.com: ${zervCount}`);
  console.log("─".repeat(50));

  db.close();
}

generateCredentials().catch((err) => {
  console.error("Error:", err);
  db.close();
  process.exit(1);
});