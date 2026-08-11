const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sima.db');

// Get the latest verification code for test3@example.com
db.get(
  `SELECT code FROM email_verification WHERE email = 'test3@example.com' ORDER BY created_at DESC LIMIT 1`,
  (err, row) => {
    if (err) {
      console.error("Error:", err.message);
    } else if (row) {
      console.log(`Verification code: ${row.code}`);
    } else {
      console.log("No verification code found");
    }
    db.close();
  }
);
