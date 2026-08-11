const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('sima.db');

db.get("SELECT * FROM email_verification WHERE email = ?", ['testuser@test.com'], (err, row) => {
  if (err) {
    console.error('Error:', err);
  } else if (row) {
    console.log('Code:', row.code || row.verification_code || JSON.stringify(row));
  } else {
    console.log('No record found');
  }
  db.close();
});
