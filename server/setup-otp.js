const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking database setup...\n');

// Run all queries in sequence
db.serialize(() => {
    
    // 1. Create OTP table
    console.log('📋 Creating booking_otps table...');
    db.run(`
        CREATE TABLE IF NOT EXISTS booking_otps (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id  INTEGER NOT NULL UNIQUE,
            otp_code    TEXT NOT NULL,
            expires_at  TEXT NOT NULL,
            is_used     INTEGER NOT NULL DEFAULT 0,
            created_at  TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.log('❌ Error creating table:', err.message);
        } else {
            console.log('✅ booking_otps table created/verified\n');
        }
    });
    
    // 2. Check users table has email column
    console.log('📋 Checking users table...');
    db.get(`SELECT email FROM users LIMIT 1`, (err, row) => {
        if (err) {
            console.log('❌ Error:', err.message);
        } else if (row) {
            console.log('✅ Users table has email column - Example:', row.email);
        } else {
            console.log('⚠️ Users table exists but no data found, column structure is correct');
        }
        console.log('');
    });
    
    // 3. Check providers joined with users
    console.log('📋 Checking providers and users relationship...');
    db.all(`
        SELECT p.full_name, u.email 
        FROM providers p 
        JOIN users u ON p.user_id = u.id 
        LIMIT 3
    `, (err, rows) => {
        if (err) {
            console.log('❌ Error:', err.message);
        } else if (rows && rows.length > 0) {
            console.log('✅ Provider-User relationship working:');
            rows.forEach(row => {
                console.log(`   👤 ${row.full_name} - 📧 ${row.email}`);
            });
        } else {
            console.log('⚠️ No provider-user data found yet (this is fine if no providers registered)');
        }
        console.log('');
    });
    
    // 4. Check bookings table structure
    console.log('📋 Checking bookings table...');
    db.all(`PRAGMA table_info(bookings)`, (err, columns) => {
        if (err) {
            console.log('❌ Error:', err.message);
        } else {
            console.log('✅ Bookings table columns:');
            columns.forEach(col => {
                console.log(`   - ${col.name} (${col.type})`);
            });
        }
        console.log('');
    });
    
    // 5. Show all tables for verification
    console.log('📋 All tables in database:');
    db.all(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`, (err, tables) => {
        if (err) {
            console.log('❌ Error:', err.message);
        } else {
            tables.forEach(table => {
                if (table.name === 'booking_otps') {
                    console.log(`   ✅ ${table.name} - NEW`);
                } else {
                    console.log(`   📌 ${table.name}`);
                }
            });
        }
        console.log('\n✨ Setup complete!');
        db.close();
    });
});