const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('app.db');

db.all("SELECT sql FROM sqlite_master WHERE type='table' ORDER BY name", (err, rows) => {
  if (err) throw err;
  rows.forEach(t => console.log(t.sql + ';\n'));
  db.close();
});
