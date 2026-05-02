// server/diagnose-providers.js
const db = require('./db');

console.log('\n🔍 PROVIDER DATABASE DIAGNOSIS\n');
console.log('=' .repeat(50));

// Total count
db.get(`SELECT COUNT(*) as total FROM providers`, [], (err, r) => {
  console.log(`\n📊 Total providers: ${r?.total}`);
});

// Count by verification status
db.all(`SELECT is_verified, COUNT(*) as count FROM providers GROUP BY is_verified`, [], (err, rows) => {
  console.log(`\n✅ By verification status:`);
  rows.forEach(r => {
    console.log(`   is_verified=${r.is_verified}: ${r.count} providers`);
  });
});

// Show last 20 providers added
db.all(`SELECT id, full_name, is_verified, created_at FROM providers ORDER BY id DESC LIMIT 20`, [], (err, rows) => {
  console.log(`\n📋 Last 20 providers added:`);
  rows.forEach(p => {
    console.log(`   ID:${p.id} | ${p.full_name} | verified:${p.is_verified} | ${p.created_at}`);
  });
});

// Check for duplicates by name
db.all(`SELECT full_name, COUNT(*) as count FROM providers GROUP BY full_name HAVING count > 1 ORDER BY count DESC LIMIT 10`, [], (err, rows) => {
  if (rows && rows.length > 0) {
    console.log(`\n⚠️ Duplicate provider names:`);
    rows.forEach(r => {
      console.log(`   "${r.full_name}" appears ${r.count} times`);
    });
  } else {
    console.log(`\n✅ No duplicate names found`);
  }
});

// Check providers with no bookings
db.get(`SELECT COUNT(*) as count FROM providers WHERE id NOT IN (SELECT DISTINCT provider_id FROM bookings WHERE provider_id IS NOT NULL)`, [], (err, r) => {
  console.log(`\n📭 Providers with NO bookings: ${r?.count}`);
});

// Sample of providers with no bookings
db.all(`SELECT id, full_name FROM providers WHERE id NOT IN (SELECT DISTINCT provider_id FROM bookings WHERE provider_id IS NOT NULL) LIMIT 10`, [], (err, rows) => {
  if (rows && rows.length > 0) {
    console.log(`\n   Sample:`);
    rows.forEach(p => {
      console.log(`   - ID:${p.id} | ${p.full_name}`);
    });
  }
});

console.log('\n' + '=' .repeat(50));
console.log('💡 To fix: Decide which providers to keep\n');