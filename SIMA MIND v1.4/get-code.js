const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('sima.db');

db.get(
  "SELECT code FROM email_verification WHERE email = ? ORDER BY created_at DESC LIMIT 1",
  ['profile.test2@example.com'],
  (err, row) => {
    if (err) console.error(err);
    console.log(row?.code || 'Not found');
    db.close();
  }
);
