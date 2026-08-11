const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('sima.db');

db.all("PRAGMA table_info(users)", (err, rows) => {
  if (err) {
    console.error('Schema error:', err);
  } else {
    console.log('Columns:');
    rows.forEach(r => console.log('  ' + r.name));
  }
  db.close();
});
