require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const AuthManager = require("./auth");

const db = new sqlite3.Database("./sima.db", (err) => {
  if (err) {
    console.error("Failed to open sima.db:", err);
    process.exit(1);
  }

  const auth = new AuthManager(db);
  setTimeout(() => {
    auth.ensureReviewAccount().then((result) => {
      db.get(
        "SELECT email, role, password_hash FROM users WHERE email = ?",
        ["googleplay@sima-mind.app"],
        (err, row) => {
          if (err) {
            console.error("Query failed:", err);
            process.exit(1);
          }

          console.log(JSON.stringify({ result, row }, null, 2));
          process.exit(0);
        }
      );
    }).catch((err) => {
      console.error("Failed to ensure review account:", err);
      process.exit(1);
    });
  }, 500);
});
