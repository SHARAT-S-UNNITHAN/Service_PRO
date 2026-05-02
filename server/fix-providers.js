// server/fix-providers.js
const db = require('./db');

console.log('\n📊 PROVIDER DATABASE CLEANUP\n');

// Check current count
db.get(`SELECT COUNT(*) as count FROM providers`, [], (err, result) => {
  console.log(`Current providers: ${result?.count}`);
});

// List providers to delete
const testProviderNames = [
  'Quick Service', 'Pro Electric', 'Best Plumbing', 'Elite AC', 'Smart Home',
  'Fast Repair', 'Quality Work', 'Trusted Service', 'Expert Hands', 'Reliable Co',
  'CSV Provider', 'Sample Provider', 'Default Provider'
];

// Count test providers
db.all(`SELECT id, full_name FROM providers WHERE full_name IN (${testProviderNames.map(() => '?').join(',')})`, testProviderNames, (err, rows) => {
  console.log(`\n📋 Test providers to delete: ${rows?.length || 0}`);
  if (rows && rows.length > 0) {
    rows.forEach(p => console.log(`   - ${p.full_name} (ID: ${p.id})`));
  }
  
  // Delete test providers
  db.run(`DELETE FROM providers WHERE full_name IN (${testProviderNames.map(() => '?').join(',')})`, testProviderNames, function(err) {
    console.log(`\n🗑️ Deleted ${this.changes} test providers`);
    
    // Also delete any with CSV in name
    db.run(`DELETE FROM providers WHERE full_name LIKE '%CSV%'`, function(err) {
      console.log(`🗑️ Deleted ${this.changes} additional CSV providers`);
      
      // Check new count
      db.get(`SELECT COUNT(*) as count FROM providers`, [], (err, result) => {
        console.log(`\n✅ New provider count: ${result?.count}`);
        
        // Count verified providers
        db.get(`SELECT COUNT(*) as count FROM providers WHERE is_verified = 1`, [], (err, result) => {
          console.log(`✅ Verified providers: ${result?.count}`);
          
          // Count providers with bookings
          db.get(`SELECT COUNT(DISTINCT provider_id) as count FROM bookings WHERE provider_id IS NOT NULL`, [], (err, result) => {
            console.log(`✅ Providers with bookings: ${result?.count}`);
            console.log('\n🎯 Analytics should now show correct numbers!\n');
            process.exit(0);
          });
        });
      });
    });
  });
});