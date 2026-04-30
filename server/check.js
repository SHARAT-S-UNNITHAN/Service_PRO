// server/check.js this is for admin provider and usr count fetching.
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('app.db');

db.all("SELECT id, email, role FROM users WHERE role = 'admin'", (err, admins) => {
    if (err) console.error(err);
    else if (admins.length === 0) console.log('❌ No admin user found!');
    else {
        console.log('✅ Admin user(s):');
        admins.forEach(a => console.log(`   Email: ${a.email}`));
    }
    
    db.all("SELECT role, COUNT(*) as count FROM users GROUP BY role", (err, stats) => {
        console.log('\n📊 Total Accounts:');
        stats.forEach(s => console.log(`   ${s.role}s: ${s.count}`));
        db.close();
    });
});