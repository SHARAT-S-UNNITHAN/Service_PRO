// db.js
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

const DB_PATH = path.join(__dirname, "app.db");

const db = new sqlite3.Database(
  DB_PATH,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("❌ Failed to open database:", err.message);
      process.exit(1);
    }
    console.log(`✅ Connected to SQLite DB: ${DB_PATH}`);
  }
);

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");

  // =========================
  // USERS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('user', 'provider', 'admin')) NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // =========================
  // PROVIDERS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      username TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL CHECK(length(phone) = 10),
      district TEXT NOT NULL,
      region TEXT NOT NULL,
      address TEXT NOT NULL,
      description TEXT,
      profile_photo TEXT,
      id_proof TEXT,
      license_doc TEXT,
      is_verified BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // =========================
  // PROVIDER PROFESSIONS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS provider_professions (
      provider_id INTEGER NOT NULL,
      profession TEXT NOT NULL,
      PRIMARY KEY (provider_id, profession),
      FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
    )
  `);

  // =========================
  // PROFESSIONS MASTER (Categories)
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS professions_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // =========================
  // CUSTOMERS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL CHECK(length(phone) = 10),
      address TEXT NOT NULL,
      landmark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // =========================
  // BOOKINGS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      service_description TEXT NOT NULL,
      scheduled_date DATETIME NOT NULL,
      address TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'accepted', 'completed', 'cancelled', 'rejected')) NOT NULL DEFAULT 'pending',
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      responded_at DATETIME,
      completed_at DATETIME,
      
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
    )
  `);

  // =========================
  // REVIEWS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      review_text TEXT,
      response_time_minutes INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
    )
  `);

  // =========================
  // ADMIN AUDIT LOGS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // =========================
  // ANNOUNCEMENTS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      target_role TEXT CHECK(target_role IN ('all', 'user', 'provider')) DEFAULT 'all',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // =========================
  // PROVIDER COMPLAINTS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS provider_complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      customer_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      
      subject TEXT NOT NULL,
      complaint_text TEXT NOT NULL,
      severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
      
      status TEXT CHECK(status IN ('pending', 'under_review', 'resolved', 'dismissed')) DEFAULT 'pending',
      admin_notes TEXT,
      warning_sent INTEGER DEFAULT 0,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
    )
  `);

  // =========================
  // SAFE MIGRATIONS
  // =========================

  // Add responded_at if missing
  db.run(`ALTER TABLE bookings ADD COLUMN responded_at DATETIME`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.error("Error adding responded_at:", err.message);
    }
  });

  // Add completed_at if missing
  db.run(`ALTER TABLE bookings ADD COLUMN completed_at DATETIME`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.error("Error adding completed_at:", err.message);
    }
  });

  // Add warning_sent if missing
  db.run(`ALTER TABLE provider_complaints ADD COLUMN warning_sent INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.error("Error adding warning_sent:", err.message);
    }
  });

  // Add review moderation columns
  db.run(`ALTER TABLE reviews ADD COLUMN is_flagged INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.error("Error adding is_flagged:", err.message);
    }
  });
  db.run(`ALTER TABLE reviews ADD COLUMN flag_reason TEXT`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.error("Error adding flag_reason:", err.message);
    }
  });
  db.run(`ALTER TABLE reviews ADD COLUMN ip_address TEXT`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.error("Error adding ip_address:", err.message);
    }
  });

  // =========================
  // INDEXES
  // =========================
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_complaints_provider ON provider_complaints(provider_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_complaints_customer ON provider_complaints(customer_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_complaints_status ON provider_complaints(status)`);

  // =========================
  // ADMIN SEED
  // =========================
  db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", (err, row) => {
    if (err) return console.error(err.message);

    if (row.count === 0) {
      bcrypt.hash("admin123", 10, (err, hash) => {
        if (err) return console.error(err.message);

        db.run(
          "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
          ["admin@demo.com", hash, "admin"]
        );

        console.log("👑 Admin created: admin@demo.com / admin123");
      });
    }
  });
});

// =========================
// GRACEFUL SHUTDOWN
// =========================
const shutdown = () => {
  db.close((err) => {
    if (err) console.error("❌ Error closing DB:", err.message);
    else console.log("🛑 Database closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

module.exports = db;