/**
 * UsageManager - Tracks daily usage limits with input-weighted costs
 * Implements smart budget system for different input types
 */

class UsageManager {
  constructor(db) {
    this.db = db;
    this.initTables();

    // Input cost system (in units)
    this.INPUT_COSTS = {
      text: 1,
      image: 5,
      pdf: 8,
      ppt: 10,
      video: 15,
      audio: 12,
    };

    // Plan limits (units per 12 hours)
    this.PLAN_LIMITS = {
      free: 30,
      standard: 150,
      pro: 999999, // effectively unlimited
      trial: 30,
    };

    this.RESET_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours
  }

  initTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS usage_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        plan TEXT NOT NULL,
        input_type TEXT NOT NULL,
        cost INTEGER NOT NULL,
        daily_total INTEGER DEFAULT 0,
        last_reset TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS usage_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        input_type TEXT,
        cost INTEGER,
        daily_total_before INTEGER,
        daily_total_after INTEGER,
        allowed INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  }

  /**
   * Get input cost
   */
  getInputCost(inputType) {
    return this.INPUT_COSTS[inputType] || 1;
  }

  /**
   * Get plan daily limit
   */
  getPlanLimit(plan) {
    return this.PLAN_LIMITS[plan] || this.PLAN_LIMITS.free;
  }

  /**
   * Initialize usage tracking for new user
   */
  initializeUsage(userId, plan) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO usage_tracking 
        (user_id, plan, input_type, cost, daily_total, last_reset, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const now = new Date().toISOString();

      this.db.run(
        sql,
        [userId, plan, "init", 0, 0, now, now],
        (err) => {
          if (err) reject(err);
          else resolve({ userId, plan, dailyTotal: 0 });
        }
      );
    });
  }

  /**
   * Check if user can proceed with action
   */
  async canProceed(userId, inputType, plan) {
    const cost = this.getInputCost(inputType);
    const limit = this.getPlanLimit(plan);

    const usage = await this.getCurrentUsage(userId);
    const remainingBudget = limit - usage.daily_total;

    return {
      allowed: remainingBudget >= cost,
      cost,
      remaining: Math.max(0, remainingBudget),
      dailyLimit: limit,
      currentUsage: usage.daily_total,
    };
  }

  /**
   * Get current usage for user
   */
  getCurrentUsage(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM usage_tracking 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      this.db.get(sql, [userId], async (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve({ user_id: userId, daily_total: 0, last_reset: new Date().toISOString() });
        } else {
          // Check if reset needed
          const now = new Date();
          const lastReset = new Date(row.last_reset);
          const timeSinceReset = now - lastReset;

          if (timeSinceReset >= this.RESET_INTERVAL) {
            // Reset usage
            await this.resetUsage(userId);
            resolve({ user_id: userId, daily_total: 0, last_reset: now.toISOString() });
          } else {
            resolve(row);
          }
        }
      });
    });
  }

  /**
   * Reset usage after 12 hours
   */
  resetUsage(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE usage_tracking 
        SET daily_total = 0, last_reset = ? 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      const now = new Date().toISOString();

      this.db.run(sql, [now, userId], (err) => {
        if (err) reject(err);
        else resolve({ reset: true });
      });
    });
  }

  /**
   * Deduct usage after action completes
   */
  async deductUsage(userId, inputType, plan) {
    const cost = this.getInputCost(inputType);
    const canProc = await this.canProceed(userId, inputType, plan);

    if (!canProc.allowed) {
      return {
        success: false,
        reason: "limit_reached",
        message: `Limit reached. You have ${canProc.remaining} units remaining. Try again in 12 hours or upgrade.`,
      };
    }

    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE usage_tracking 
        SET daily_total = daily_total + ? 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      this.db.run(sql, [cost, userId], async (err) => {
        if (err) {
          reject(err);
        } else {
          // Log to history
          const usage = await this.getCurrentUsage(userId);
          this.logUsage(userId, inputType, cost, canProc.dailyLimit - cost, canProc.dailyLimit - usage.daily_total, true);

          resolve({
            success: true,
            cost,
            remaining: Math.max(0, canProc.dailyLimit - usage.daily_total),
            message: `Usage deducted. ${Math.max(0, canProc.dailyLimit - usage.daily_total)} units remaining.`,
          });
        }
      });
    });
  }

  /**
   * Log usage action to history
   */
  logUsage(userId, inputType, cost, dailyBefore, dailyAfter, allowed) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO usage_history 
        (user_id, action, input_type, cost, daily_total_before, daily_total_after, allowed, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(
        sql,
        [userId, "input_processed", inputType, cost, dailyBefore, dailyAfter, allowed ? 1 : 0, new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve({ logged: true });
        }
      );
    });
  }

  /**
   * Get usage history
   */
  getUsageHistory(userId, limit = 50) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM usage_history 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `;

      this.db.all(sql, [userId, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Get usage analytics for admin
   */
  getUsageAnalytics(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          input_type,
          COUNT(*) as total_actions,
          SUM(cost) as total_cost,
          AVG(cost) as avg_cost
        FROM usage_history 
        WHERE user_id = ? 
        GROUP BY input_type
        ORDER BY total_cost DESC
      `;

      this.db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

module.exports = UsageManager;
