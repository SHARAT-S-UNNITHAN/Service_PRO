const db = require('./db');

console.log('Adding ML scoring columns...');

db.run(`ALTER TABLE providers ADD COLUMN completion_rate REAL DEFAULT 100`, (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.log('completion_rate column may already exist');
  } else {
    console.log('✓ completion_rate column added');
  }
});

db.run(`ALTER TABLE providers ADD COLUMN trust_score REAL DEFAULT 100`, (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.log('trust_score column may already exist');
  } else {
    console.log('✓ trust_score column added');
  }
});

db.run(`ALTER TABLE providers ADD COLUMN total_earnings REAL DEFAULT 0`, (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.log('total_earnings column may already exist');
  } else {
    console.log('✓ total_earnings column added');
  }
});

console.log('Migration complete!');