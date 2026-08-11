const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { authenticator } = require("otplib");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "7d";
const MFA_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const MAX_DEVICES = parseInt(process.env.MAX_DEVICES || "3", 10);
const DEVICE_TYPES = ["phone", "pc", "tablet"];
const BCRYPT_ROUNDS = parseInt(process.env.PASSWORD_SALT_ROUNDS || "12", 10);

authenticator.options = { step: 30, window: 1 };

class AuthManager {
  constructor(db) {
    this.db = db;
    this.initTables();
    setImmediate(() => {
      this.ensureReviewAccount().catch((error) => {
        console.error("Failed to bootstrap review account:", error);
      });
    });
  }

  initTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        mfa_enabled INTEGER DEFAULT 0,
        mfa_secret TEXT,
        email_verified INTEGER DEFAULT 0,
        phone_verified INTEGER DEFAULT 0,
        country_code TEXT DEFAULT '+260',
        profile_picture_url TEXT,
        preferred_learning_styles TEXT,
        role TEXT DEFAULT 'student',
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        mfa_type TEXT DEFAULT 'code',
        mfa_secret_temp TEXT
      )
    `);

    this.db.run(`
      ALTER TABLE users ADD COLUMN mfa_secret_temp TEXT`,
      () => {}
    );
    this.db.run(`
      ALTER TABLE users ADD COLUMN mfa_type TEXT DEFAULT 'code'`,
      () => {}
    );

    this.db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        device_id TEXT,
        device_name TEXT,
        device_type TEXT,
        ip_address TEXT,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS mfa_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        code TEXT,
        verified INTEGER DEFAULT 0,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS email_verification (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        verified INTEGER DEFAULT 0,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS phone_verification (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT NOT NULL,
        code TEXT NOT NULL,
        verified INTEGER DEFAULT 0,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        size INTEGER,
        type TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        deck_id TEXT,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        interval INTEGER DEFAULT 1,
        ease_factor REAL DEFAULT 2.5,
        reviews INTEGER DEFAULT 0,
        last_review_date TEXT,
        next_review_date TEXT,
        last_quality INTEGER,
        suspended INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS quiz_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        quiz_id TEXT,
        total_questions INTEGER,
        correct_answers INTEGER,
        score_percentage INTEGER,
        time_taken INTEGER,
        passed INTEGER,
        responses TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS study_plans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        goals TEXT,
        weekly_schedule TEXT,
        daily_tasks TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        next_review_date TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_performance (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        metric_type TEXT,
        value REAL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_gamification (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        total_points INTEGER DEFAULT 0,
        current_level INTEGER DEFAULT 1,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        total_achievements INTEGER DEFAULT 0,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS daily_challenges (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        challenge_id TEXT NOT NULL,
        challenge_date TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        reward_earned INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  }

  hashPassword(password) {
    // Use bcrypt (with JWT_SECRET as a server-side pepper) for new hashes
    try {
      const salted = password + JWT_SECRET;
      return bcrypt.hashSync(salted, BCRYPT_ROUNDS);
    } catch (e) {
      // Fallback to sha256 if bcrypt fails for any reason
      return crypto.createHash("sha256").update(password + JWT_SECRET).digest("hex");
    }
  }

  verifyPassword(password, hash, userId = null) {
    // If stored hash looks like bcrypt, verify with bcrypt
    try {
      if (typeof hash === "string" && hash.startsWith("$2")) {
        return bcrypt.compareSync(password + JWT_SECRET, hash);
      }
    } catch (e) {
      // ignore and try legacy
    }

    // Legacy SHA-256: compare and migrate to bcrypt in background
    const legacy = crypto.createHash("sha256").update(password + JWT_SECRET).digest("hex");
    if (legacy === hash) {
      // Async rehash to bcrypt and update DB if userId provided
      if (userId) {
        const newHash = this.hashPassword(password);
        try {
          this.db.run(`UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`, [newHash, new Date().toISOString(), userId]);
        } catch (e) {
          // ignore
        }
      }
      return true;
    }

    return false;
  }

  async ensureReviewAccount() {
    const reviewEmail = process.env.REVIEW_ACCOUNT_EMAIL || "googleplay@sima-mind.app";
    const reviewPassword = process.env.REVIEW_ACCOUNT_PASSWORD || "g00gleplay$#%1234";
    const reviewRole = process.env.REVIEW_ACCOUNT_ROLE || "admin";
    const reviewName = process.env.REVIEW_ACCOUNT_NAME || "Googleplay";

    const attemptBootstrap = (attempt = 0) =>
      new Promise((resolve, reject) => {
        this.db.get(
          "SELECT id, email, role, password_hash FROM users WHERE email = ?",
          [reviewEmail],
          (err, row) => {
            if (err) {
              if (err.code === "SQLITE_ERROR" && /no such table: users/i.test(err.message) && attempt < 5) {
                setTimeout(() => resolve(attemptBootstrap(attempt + 1)), 50);
                return;
              }
              return reject(err);
            }

            if (row) {
              const updates = [];
              const values = [];

              if ((row.role || "student") !== reviewRole) {
                updates.push("role = ?");
                values.push(reviewRole);
              }

              const newPasswordHash = this.hashPassword(reviewPassword);
              if (row.password_hash !== newPasswordHash) {
                updates.push("password_hash = ?");
                values.push(newPasswordHash);
              }

              if (updates.length > 0) {
                values.push(new Date().toISOString(), row.id);
                this.db.run(
                  `UPDATE users SET ${updates.join(", ")}, updated_at = ? WHERE id = ?`,
                  values,
                  (updateErr) => {
                    if (updateErr) return reject(updateErr);
                    resolve({ created: false, exists: true, email: reviewEmail, role: reviewRole, name: reviewName });
                  }
                );
              } else {
                resolve({ created: false, exists: true, email: reviewEmail, role: reviewRole, name: reviewName });
              }

              return;
            }

            const userId = `user-review-${Date.now()}`;
            const passwordHash = this.hashPassword(reviewPassword);
            const now = new Date().toISOString();

            this.db.run(
              `INSERT INTO users (id, email, phone, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [userId, reviewEmail, null, passwordHash, reviewRole, now, now],
              (insertErr) => {
                if (insertErr) {
                  if (insertErr.code === "SQLITE_CONSTRAINT" && /UNIQUE|email/i.test(insertErr.message)) {
                    this.db.get(
                      "SELECT id, email, role, password_hash FROM users WHERE email = ?",
                      [reviewEmail],
                      (lookupErr, existingRow) => {
                        if (lookupErr) return reject(lookupErr);
                        if (existingRow) {
                          resolve({ created: false, exists: true, email: reviewEmail, role: reviewRole, name: reviewName });
                        } else {
                          reject(insertErr);
                        }
                      }
                    );
                    return;
                  }
                  return reject(insertErr);
                }
                resolve({ created: true, exists: false, id: userId, email: reviewEmail, role: reviewRole, name: reviewName });
              }
            );
          }
        );
      });

    return attemptBootstrap();
  }

  generateToken(userId, deviceId) {
    return jwt.sign(
      { userId, deviceId, iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return null;
    }
  }

  async registerUser(email, phone, password, name) {
    return new Promise((resolve, reject) => {
      const userId = `user-${Date.now()}`;
      const passwordHash = this.hashPassword(password);
      const now = new Date().toISOString();

      this.db.run(
        `INSERT INTO users (id, email, phone, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, email, phone, passwordHash, now, now],
        function (err) {
          if (err) reject(err);
          else resolve({ id: userId, email, phone, name });
        }
      );
    });
  }

  async createSession(userId, deviceId, deviceName, deviceType, ipAddress) {
    return new Promise(async (resolve, reject) => {
      // Check device limit
      this.db.all(
        `SELECT device_type FROM sessions WHERE user_id = ? AND expires_at > datetime('now') GROUP BY device_type`,
        [userId],
        async (err, rows) => {
          if (err) return reject(err);

          const activeDeviceTypes = rows.map(r => r.device_type);
          
          // If we're at or over the limit and trying to add a new device type
          if (activeDeviceTypes.length >= MAX_DEVICES && !activeDeviceTypes.includes(deviceType)) {
            return reject(new Error(`Maximum ${MAX_DEVICES} devices per account. Remove a device to add a new one.`));
          }

          const sessionId = `session-${Date.now()}`;
          const token = this.generateToken(userId, deviceId);
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          const now = new Date().toISOString();

          this.db.run(
            `INSERT INTO sessions (id, user_id, token, device_id, device_name, device_type, ip_address, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [sessionId, userId, token, deviceId, deviceName, deviceType, ipAddress, expiresAt, now],
            (err) => {
              if (err) reject(err);
              else resolve({ sessionId, token, expiresAt });
            }
          );
        }
      );
    });
  }

  async validateSession(token) {
    return new Promise((resolve) => {
      const decoded = this.verifyToken(token);
      if (!decoded) {
        resolve(null);
        return;
      }

      this.db.get(
        `SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')`,
        [token],
        (err, row) => {
          if (err || !row) resolve(null);
          else resolve({ sessionId: row.id, userId: row.user_id, deviceId: row.device_id });
        }
      );
    });
  }

  async getActiveSessions(userId) {
    return new Promise((resolve) => {
      this.db.all(
        `SELECT id, device_name, device_type, ip_address, created_at, expires_at FROM sessions 
         WHERE user_id = ? AND expires_at > datetime('now') ORDER BY created_at DESC`,
        [userId],
        (err, rows) => {
          resolve(err ? [] : rows);
        }
      );
    });
  }

  async removeSession(sessionId) {
    return new Promise((resolve) => {
      this.db.run(`DELETE FROM sessions WHERE id = ?`, [sessionId], (err) => {
        resolve(!err);
      });
    });
  }

  async sendEmailVerification(email) {
    return new Promise((resolve) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const now = new Date().toISOString();

      this.db.run(
        `INSERT INTO email_verification (email, code, expires_at, created_at) VALUES (?, ?, ?, ?)`,
        [email, code, expiresAt, now],
        (err) => {
          if (err) {
            resolve(null);
          } else {
            // In production, send via email service (SendGrid, AWS SES, etc.)
            resolve({ code, email, method: "email" });
          }
        }
      );
    });
  }

  async sendPhoneVerification(phone) {
    return new Promise((resolve) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const now = new Date().toISOString();

      this.db.run(
        `INSERT INTO phone_verification (phone, code, expires_at, created_at) VALUES (?, ?, ?, ?)`,
        [phone, code, expiresAt, now],
        (err) => {
          if (err) {
            resolve(null);
          } else {
            // In production, send via SMS service (Twilio, AWS SNS, etc.)
            resolve({ code, phone, method: "sms" });
          }
        }
      );
    });
  }

  async sendMFACode(userId) {
    return new Promise((resolve) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + MFA_TIMEOUT).toISOString();
      const now = new Date().toISOString();

      this.db.run(
        `INSERT INTO mfa_attempts (user_id, code, expires_at, created_at) VALUES (?, ?, ?, ?)`,
        [userId, code, expiresAt, now],
        (err) => {
          if (err) resolve(null);
          else resolve({ code, expiresAt });
        }
      );
    });
  }

  async verifyMFACode(userId, code) {
    return new Promise((resolve) => {
      this.db.run(
        `UPDATE mfa_attempts SET verified = 1 WHERE user_id = ? AND code = ? AND expires_at > datetime('now') LIMIT 1`,
        [userId, code],
        function (err) {
          resolve(!err && this.changes === 1);
        }
      );
    });
  }

  generateTOTPSecret(email) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(email, "SIMA MIND", secret);
    return { secret, otpauthUrl };
  }

  async startTOTPSetup(userId, email) {
    return new Promise((resolve, reject) => {
      const { secret, otpauthUrl } = this.generateTOTPSecret(email);
      this.db.run(
        `UPDATE users SET mfa_secret_temp = ?, updated_at = ? WHERE id = ?`,
        [secret, new Date().toISOString(), userId],
        (err) => {
          if (err) return reject(err);
          resolve({ secret, otpauthUrl });
        }
      );
    });
  }

  async confirmTOTPSetup(userId, code) {
    return new Promise((resolve) => {
      this.db.get(
        `SELECT mfa_secret_temp FROM users WHERE id = ?`,
        [userId],
        (err, row) => {
          if (err || !row || !row.mfa_secret_temp) return resolve(false);
          const valid = this.verifyTOTPCode(row.mfa_secret_temp, code);
          if (!valid) return resolve(false);

          this.db.run(
            `UPDATE users SET mfa_enabled = 1, mfa_type = 'totp', mfa_secret = ?, mfa_secret_temp = NULL, updated_at = ? WHERE id = ?`,
            [row.mfa_secret_temp, new Date().toISOString(), userId],
            (updateErr) => {
              resolve(!updateErr);
            }
          );
        }
      );
    });
  }

  async disableTOTP(userId) {
    return new Promise((resolve) => {
      this.db.run(
        `UPDATE users SET mfa_enabled = 0, mfa_type = 'code', mfa_secret = NULL, mfa_secret_temp = NULL, updated_at = ? WHERE id = ?`,
        [new Date().toISOString(), userId],
        (err) => {
          resolve(!err);
        }
      );
    });
  }

  verifyTOTPCode(secret, code) {
    try {
      return authenticator.check(code, secret);
    } catch (e) {
      return false;
    }
  }

  async verifyEmailCode(email, code) {
    return new Promise((resolve) => {
      // First check if code exists and is not expired
      this.db.get(
        `SELECT id FROM email_verification WHERE email = ? AND code = ? AND expires_at > datetime('now') AND verified = 0 LIMIT 1`,
        [email, code],
        (err, row) => {
          if (err || !row) {
            resolve(false);
          } else {
            // Mark as verified
            this.db.run(
              `UPDATE email_verification SET verified = 1 WHERE id = ?`,
              [row.id],
              (updateErr) => {
                resolve(!updateErr);
              }
            );
          }
        }
      );
    });
  }

  async verifyPhoneCode(phone, code) {
    return new Promise((resolve) => {
      // First check if code exists and is not expired
      this.db.get(
        `SELECT id FROM phone_verification WHERE phone = ? AND code = ? AND expires_at > datetime('now') AND verified = 0 LIMIT 1`,
        [phone, code],
        (err, row) => {
          if (err || !row) {
            resolve(false);
          } else {
            // Mark as verified
            this.db.run(
              `UPDATE phone_verification SET verified = 1 WHERE id = ?`,
              [row.id],
              (updateErr) => {
                resolve(!updateErr);
              }
            );
          }
        }
      );
    });
  }

  async logout(sessionId) {
    return new Promise((resolve) => {
      this.db.run(
        `DELETE FROM sessions WHERE id = ?`,
        [sessionId],
        (err) => {
          resolve(!err);
        }
      );
    });
  }
}

module.exports = AuthManager;

