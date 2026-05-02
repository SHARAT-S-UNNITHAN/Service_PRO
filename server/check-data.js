// server/check-data.js
const db = require('./db');

console.log('\n📊 DATABASE CHECK\n');
console.log('=' .repeat(40));

// Total bookings
db.get(`SELECT COUNT(*) as count FROM bookings`, [], (err, result) => {
  console.log(`📝 Total Bookings: ${result?.count || 0}`);
});

// Real bookings (user_id != 1)
db.get(`SELECT COUNT(*) as count FROM bookings WHERE user_id != 1`, [], (err, result) => {
  console.log(`👤 Real Bookings: ${result?.count || 0}`);
});

// CSV bookings (user_id = 1)
db.get(`SELECT COUNT(*) as count FROM bookings WHERE user_id = 1`, [], (err, result) => {
  console.log(`📄 CSV Bookings: ${result?.count || 0}`);
});

// Total reviews
db.get(`SELECT COUNT(*) as count FROM reviews`, [], (err, result) => {
  console.log(`⭐ Total Reviews: ${result?.count || 0}`);
});

// CSV reviews
db.get(`SELECT COUNT(*) as count FROM reviews WHERE review_text LIKE '%CSV%'`, [], (err, result) => {
  console.log(`📄 CSV Reviews: ${result?.count || 0}`);
});

// Wait a bit to see results
setTimeout(() => {
  console.log('\n' + '=' .repeat(40));
  console.log('✅ Check complete!\n');
  process.exit(0);
}, 1000);