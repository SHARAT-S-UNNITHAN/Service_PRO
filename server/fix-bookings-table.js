const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('app.db');

console.log('🔧 Fixing bookings table...\n');

// Add missing columns
const alterQueries = [
  "ALTER TABLE bookings ADD COLUMN notes TEXT",
  "ALTER TABLE bookings ADD COLUMN responded_at TEXT"
];

let completed = 0;

alterQueries.forEach(sql => {
  db.run(sql, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('❌ Error:', err.message);
    } else if (err && err.message.includes('duplicate column name')) {
      console.log('⚠️ Column already exists');
    } else {
      console.log('✅ Column added successfully');
    }
    completed++;
    if (completed === alterQueries.length) {
      // Show final table structure
      db.all("PRAGMA table_info(bookings)", (err, columns) => {
        console.log('\n📋 Final bookings table columns:');
        columns.forEach(col => {
          console.log(`   ${col.name} (${col.type})`);
        });
        db.close();
      });
    }
  });
});