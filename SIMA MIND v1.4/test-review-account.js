const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const AuthManager = require("./auth");

(async () => {
  const dbPath = path.join(__dirname, "test-review-account.db");
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = new sqlite3.Database(dbPath);
  const authManager = new AuthManager(db);

  await new Promise((resolve) => setTimeout(resolve, 250));

  const result = await authManager.ensureReviewAccount();

  const row = await new Promise((resolve, reject) => {
    db.get(
      "SELECT email, role, password_hash FROM users WHERE email = ?",
      ["googleplay@sima-mind.app"],
      (err, row) => (err ? reject(err) : resolve(row))
    );
  });

  if (!row || !row.password_hash) {
    throw new Error("Review account was not created");
  }

  console.log(JSON.stringify({ ok: true, result, row }, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
