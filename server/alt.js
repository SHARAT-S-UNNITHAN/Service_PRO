const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "app.db");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Failed to connect:", err.message);
    process.exit(1);
  }
  console.log("Connected to database");
});

// Function to check if column exists
const columnExists = (table, column, callback) => {
  db.all(`PRAGMA table_info(${table});`, (err, columns) => {
    if (err) return callback(err);

    const exists = columns.some(col => col.name === column);
    callback(null, exists);
  });
};

db.serialize(() => {
  columnExists("providers", "is_active", (err, exists) => {
    if (err) {
      console.error("Error checking column:", err.message);
      return;
    }

    if (exists) {
      console.log("Column 'is_active' already exists ✅");
    } else {
      db.run(
        `ALTER TABLE providers ADD COLUMN is_active INTEGER DEFAULT 1`,
        (err) => {
          if (err) {
            console.error("Error adding column:", err.message);
          } else {
            console.log("Column 'is_active' added successfully ✅");
          }
        }
      );
    }
  });
});

// Close DB after short delay
setTimeout(() => {
  db.close(() => {
    console.log("Database connection closed");
  });
}, 2000);