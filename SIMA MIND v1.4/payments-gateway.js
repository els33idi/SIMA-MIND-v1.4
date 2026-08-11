class PaymentGateway {
  constructor(db, security) {
    this.db = db;
    this.security = security;
    this.initTables();
  }

  initTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        method TEXT NOT NULL,
        gateway TEXT,
        status TEXT DEFAULT 'pending',
        payment_data_encrypted TEXT,
        receipt_id TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        method_type TEXT NOT NULL,
        method_name TEXT,
        token TEXT,
        is_default INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  }

  async processVISA(userId, cardData, amount, currency) {
    // VISA payment simulation
    const transactionId = `visa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const encrypted = this.security.encryptPaymentData({
      lastFour: cardData.cardNumber.slice(-4),
      type: "VISA",
    });

    return this._recordTransaction(userId, transactionId, amount, currency, "VISA", "stripe", encrypted);
  }

  async processAirtelMoney(userId, phoneNumber, amount, currency) {
    // Airtel Money integration
    const transactionId = `airtel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const encrypted = this.security.encryptPaymentData({
      phone: phoneNumber,
      provider: "airtel",
    });

    return this._recordTransaction(
      userId,
      transactionId,
      amount,
      currency,
      "AIRTEL_MONEY",
      "airtel-gateway",
      encrypted
    );
  }

  async processMTNMoney(userId, phoneNumber, amount, currency) {
    // MTN Mobile Money integration
    const transactionId = `mtn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const encrypted = this.security.encryptPaymentData({
      phone: phoneNumber,
      provider: "mtn",
    });

    return this._recordTransaction(userId, transactionId, amount, currency, "MTN_MONEY", "mtn-gateway", encrypted);
  }

  async processBankTransfer(userId, bankData, amount, currency) {
    // Bank transfer integration
    const transactionId = `bank-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const encrypted = this.security.encryptPaymentData({
      accountNumber: bankData.accountNumber.slice(-4),
      bankName: bankData.bankName,
    });

    return this._recordTransaction(
      userId,
      transactionId,
      amount,
      currency,
      "BANK_TRANSFER",
      "bank-gateway",
      encrypted
    );
  }

  async _recordTransaction(userId, transactionId, amount, currency, method, gateway, encryptedData) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const receiptId = `RCT-${transactionId.split("-")[1]}`;

      this.db.run(
        `INSERT INTO payment_transactions (transaction_id, user_id, amount, currency, method, gateway, payment_data_encrypted, receipt_id, status, created_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [transactionId, userId, amount, currency, method, gateway, encryptedData, receiptId, "completed", now, now],
        function (err) {
          if (err) reject(err);
          else {
            resolve({
              transactionId,
              receiptId,
              status: "completed",
              amount,
              currency,
              method,
            });
          }
        }
      );
    });
  }

  async getTransactionHistory(userId, limit = 50) {
    return new Promise((resolve) => {
      this.db.all(
        `SELECT transaction_id, amount, currency, method, status, receipt_id, created_at FROM payment_transactions
         WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
        [userId, limit],
        (err, rows) => {
          resolve(err ? [] : rows);
        }
      );
    });
  }

  async refundTransaction(transactionId, reason) {
    return new Promise((resolve) => {
      const now = new Date().toISOString();
      this.db.run(
        `UPDATE payment_transactions SET status = 'refunded' WHERE transaction_id = ?`,
        [transactionId],
        (err) => {
          if (err) resolve(false);
          else {
            this.db.run(
              `INSERT INTO audit_logs (action, resource_type, resource_id, status, details, created_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
              ["refund", "payment", transactionId, "completed", JSON.stringify({ reason }), now]
            );
            resolve(true);
          }
        }
      );
    });
  }
}

module.exports = PaymentGateway;
