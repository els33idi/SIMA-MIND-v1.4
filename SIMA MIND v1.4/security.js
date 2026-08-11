const crypto = require("crypto");

class SecurityManager {
  constructor(db) {
    this.db = db;
    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
    this.initTables();
  }

  initTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_id TEXT,
        status TEXT,
        ip_address TEXT,
        user_agent TEXT,
        details TEXT,
        created_at TEXT NOT NULL
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS data_backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        backup_type TEXT NOT NULL,
        data_size INTEGER,
        region TEXT,
        status TEXT DEFAULT 'completed',
        created_at TEXT NOT NULL,
        expires_at TEXT
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS encryption_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_id TEXT UNIQUE NOT NULL,
        algorithm TEXT DEFAULT 'aes-256-gcm',
        rotation_status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        rotated_at TEXT
      )
    `);
  }

  // Encryption methods
  encrypt(plaintext, keyId = "default") {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(this.encryptionKey, "hex"), iv);
      let encrypted = cipher.update(plaintext, "utf8", "hex");
      encrypted += cipher.final("hex");
      const authTag = cipher.getAuthTag();
      return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
    } catch (e) {
      console.error("Encryption error:", e);
      return null;
    }
  }

  decrypt(ciphertext) {
    try {
      const [iv, authTag, encrypted] = ciphertext.split(":");
      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        Buffer.from(this.encryptionKey, "hex"),
        Buffer.from(iv, "hex")
      );
      decipher.setAuthTag(Buffer.from(authTag, "hex"));
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (e) {
      console.error("Decryption error:", e);
      return null;
    }
  }

  // Audit logging
  async logAction(userId, action, resourceType, resourceId, status, ipAddress, userAgent, details = {}) {
    return new Promise((resolve) => {
      const now = new Date().toISOString();
      this.db.run(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, status, ip_address, user_agent, details, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, action, resourceType, resourceId, status, ipAddress, userAgent, JSON.stringify(details), now],
        (err) => {
          resolve(!err);
        }
      );
    });
  }

  async getAuditLog(filters = {}) {
    return new Promise((resolve) => {
      let query = "SELECT * FROM audit_logs WHERE 1=1";
      const params = [];

      if (filters.userId) {
        query += " AND user_id = ?";
        params.push(filters.userId);
      }
      if (filters.action) {
        query += " AND action = ?";
        params.push(filters.action);
      }
      if (filters.startDate) {
        query += " AND created_at >= ?";
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        query += " AND created_at <= ?";
        params.push(filters.endDate);
      }

      const limit = Number.isInteger(filters.limit) ? filters.limit : 25;
      const offset = Number.isInteger(filters.offset) ? filters.offset : 0;
      query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
      params.push(limit, offset);

      this.db.all(query, params, (err, rows) => {
        resolve(err ? [] : rows);
      });
    });
  }

  // Data backup
  async createBackup(backupType, dataSize, region = "primary") {
    return new Promise((resolve) => {
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days

      this.db.run(
        `INSERT INTO data_backups (backup_type, data_size, region, status, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [backupType, dataSize, region, "completed", now, expiresAt],
        (err) => {
          resolve(!err);
        }
      );
    });
  }

  async getBackupStatus(days = 7) {
    return new Promise((resolve) => {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      this.db.all(
        `SELECT * FROM data_backups WHERE created_at >= ? ORDER BY created_at DESC`,
        [cutoffDate],
        (err, rows) => {
          resolve(err ? [] : rows);
        }
      );
    });
  }

  // Session encryption
  encryptPaymentData(cardData) {
    return this.encrypt(JSON.stringify(cardData));
  }

  decryptPaymentData(encrypted) {
    const decrypted = this.decrypt(encrypted);
    try {
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  // Hash sensitive data (one-way)
  hashSensitiveData(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
  }
}

module.exports = SecurityManager;
