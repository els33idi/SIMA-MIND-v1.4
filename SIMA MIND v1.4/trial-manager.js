/**
 * TrialManager - Handles 14-day free trial system
 * Tracks trial status, days remaining, and auto-downgrade to free plan
 */

class TrialManager {
  constructor(db) {
    this.db = db;
    this.TRIAL_DAYS = 14;
    this.PLANS = {
      trial: { plan: 'trial', name: 'Trial', price: 'Free', duration: '14 days', features: ['Basic chat', 'Document upload', 'Summarization'] },
      free: { plan: 'free', name: 'Free', price: 'Always Free', duration: 'Unlimited', features: ['Basic chat', 'Document upload', 'Summarization'] },
      standard: { plan: 'standard', name: 'Standard', price: '$9.99/month', duration: '30 days', features: ['All Free', 'Flashcards', 'Quizzes', 'Smart Planner', 'Exam Mode'] },
      pro: { plan: 'pro', name: 'Pro', price: '$29.99/month', duration: '30 days', features: ['Unlimited everything', 'Audio learning', 'Group chats', 'Priority support'] }
    };
    this.initTables();
  }

  initTables() {
    // Extend users table to include trial/subscription info
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        plan TEXT DEFAULT 'trial',
        created_at TEXT NOT NULL,
        trial_started_at TEXT NOT NULL,
        trial_ends_at TEXT NOT NULL,
        plan_started_at TEXT,
        plan_ends_at TEXT,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS trial_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        notification_type TEXT,
        days_left INTEGER,
        sent_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  }

  /**
   * Create trial subscription for new user
   */
  createTrial(userId) {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + this.TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const id = `sub_${Date.now()}`;

      const sql = `
        INSERT INTO user_subscriptions 
        (id, user_id, plan, created_at, trial_started_at, trial_ends_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `;

      this.db.run(
        sql,
        [id, userId, "trial", now.toISOString(), now.toISOString(), trialEnd.toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve({ id, plan: "trial", trialEndsAt: trialEnd });
        }
      );
    });
  }

  /**
   * Check if user is in trial period
   */
  isTrialActive(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM user_subscriptions 
        WHERE user_id = ? AND is_active = 1
      `;

      this.db.get(sql, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(false);
        } else {
          const now = new Date();
          const trialEnds = new Date(row.trial_ends_at);
          resolve(row.plan === "trial" && now < trialEnds);
        }
      });
    });
  }

  /**
   * Get days remaining in trial
   */
  getTrialDaysRemaining(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT trial_ends_at FROM user_subscriptions 
        WHERE user_id = ? AND is_active = 1
      `;

      this.db.get(sql, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(0);
        } else {
          const now = new Date();
          const trialEnds = new Date(row.trial_ends_at);
          const daysLeft = Math.max(
            0,
            Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24))
          );
          resolve(daysLeft);
        }
      });
    });
  }

  /**
   * Upgrade from trial to paid plan
   */
  upgradePlan(userId, newPlan, stripeSubscriptionId) {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const sql = `
        UPDATE user_subscriptions 
        SET plan = ?, plan_started_at = ?, plan_ends_at = ?, 
            stripe_subscription_id = ?, is_active = 1
        WHERE user_id = ? AND is_active = 1
      `;

      const planEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      this.db.run(
        sql,
        [newPlan, now.toISOString(), planEndDate.toISOString(), stripeSubscriptionId, userId],
        function (err) {
          if (err) reject(err);
          else resolve({ plan: newPlan, startedAt: now });
        }
      );
    });
  }

  /**
   * Downgrade to free plan after trial expires
   */
  downgradeToFree(userId) {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const sql = `
        UPDATE user_subscriptions 
        SET plan = 'free', plan_started_at = ?, is_active = 1
        WHERE user_id = ? AND is_active = 1
      `;

      this.db.run(sql, [now.toISOString(), userId], function (err) {
        if (err) reject(err);
        else resolve({ plan: "free", downgradedAt: now });
      });
    });
  }

  /**
   * Get current subscription status
   */
  getSubscriptionStatus(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM user_subscriptions 
        WHERE user_id = ? AND is_active = 1
      `;

      this.db.get(sql, [userId], async (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve({ plan: "none", status: "no_subscription" });
        } else {
          const now = new Date();
          let status = "active";

          if (row.plan === "trial") {
            const trialEnds = new Date(row.trial_ends_at);
            if (now > trialEnds) {
              status = "trial_expired";
              await this.downgradeToFree(userId);
            } else {
              status = "trial_active";
            }
          }

          resolve({
            plan: row.plan,
            status,
            createdAt: row.created_at,
            trialEndsAt: row.trial_ends_at,
            planEndsAt: row.plan_ends_at,
            daysRemaining: await this.getTrialDaysRemaining(userId),
          });
        }
      });
    });
  }

  /**
   * Send upgrade reminder (call this periodically)
   */
  sendUpgradeReminder(userId, daysLeft) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO trial_notifications 
        (user_id, notification_type, days_left, sent_at)
        VALUES (?, ?, ?, ?)
      `;

      this.db.run(
        sql,
        [userId, "upgrade_reminder", daysLeft, new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve({ sent: true });
        }
      );
    });
  }

  /**
   * Get upgrade reminders sent to user
   */
  getNotifications(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM trial_notifications 
        WHERE user_id = ? 
        ORDER BY sent_at DESC 
        LIMIT 10
      `;

      this.db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Get trial status (API endpoint wrapper)
   */
  getTrialStatus(userId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM user_subscriptions WHERE user_id = ? AND is_active = 1`;
      this.db.get(sql, [userId], (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else {
          const now = new Date();
          const expiresAt = new Date(row.trial_ends_at);
          const daysLeft = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));
          const isActive = daysLeft > 0 && row.is_active && row.plan === 'trial';

          resolve({
            trialId: row.id,
            plan: row.plan,
            daysLeft,
            isActive,
            startedAt: row.trial_started_at,
            expiresAt: row.trial_ends_at,
            percentageComplete: Math.round((1 - daysLeft / this.TRIAL_DAYS) * 100)
          });
        }
      });
    });
  }

  /**
   * Get user's current plan
   */
  getUserPlan(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT plan FROM user_subscriptions WHERE user_id = ? AND is_active = 1`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.plan : 'free');
        }
      );
    });
  }

  /**
   * Get plan details (features, limits)
   */
  getPlanDetails(plan) {
    return new Promise((resolve, reject) => {
      const planDetails = {
        trial: {
          plan: 'trial',
          name: 'Trial',
          limit: 30,
          price: 'Free',
          duration: '14 days',
          features: ['Basic chat', 'Document upload', 'Summarization']
        },
        free: {
          plan: 'free',
          name: 'Free',
          limit: 30,
          price: 'Always Free',
          features: ['Basic chat', 'Document upload', 'Summarization']
        },
        standard: {
          plan: 'standard',
          name: 'Standard',
          limit: 150,
          price: '$9.99/month',
          features: ['All Free', 'Flashcards', 'Quizzes', 'Smart Planner', 'Exam Mode']
        },
        pro: {
          plan: 'pro',
          name: 'Pro',
          limit: 9999,
          price: '$29.99/month',
          features: ['Unlimited everything', 'Audio learning', 'Group chats', 'Priority support']
        }
      };
      resolve(planDetails[plan] || planDetails.free);
    });
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE user_subscriptions SET is_active = 0 WHERE user_id = ?`,
        [userId],
        function(err) {
          if (err) reject(err);
          else resolve({ message: 'Subscription cancelled', userId });
        }
      );
    });
  }
}

module.exports = TrialManager;
