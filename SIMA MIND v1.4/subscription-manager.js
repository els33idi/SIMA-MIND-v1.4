/**
 * Subscription Manager - Manages subscription tiers and feature locking
 * Tiers: trial (14 days), free, standard ($4.99/mo), pro ($14.99/mo)
 */

class SubscriptionManager {
  constructor(db) {
    this.db = db;
    this.PLANS = {
      trial: { name: 'Trial', durationDays: 14, price: 0, features: ['all'] },
      free: { name: 'Free', price: 0, monthlyLimit: 30, features: ['basic'] },
      standard: { name: 'Standard', price: 4.99, monthlyLimit: 150, features: ['standard'] },
      pro: { name: 'Pro', price: 14.99, monthlyLimit: 999999, features: ['all'] }
    };
  }

  /**
   * Get subscription details for user
   */
  async getSubscription(userId) {
    return new Promise((resolve) => {
      this.db.get(
        `SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
        [userId],
        (err, row) => {
          if (err || !row) {
            resolve(null);
            return;
          }

          const planDetails = this.PLANS[row.plan] || this.PLANS.trial;
          const now = new Date();
          const expiresAt = row.plan === 'trial' ? new Date(row.trial_ends_at) : new Date(row.subscription_expires_at);
          const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

          resolve({
            id: row.id,
            userId: row.user_id,
            plan: row.plan,
            status: row.status,
            planDetails,
            daysLeft: Math.max(0, daysLeft),
            expiresAt,
            isActive: row.status === 'active' && daysLeft > 0,
            stripeSubscriptionId: row.subscription_started_at ? 'stripe_' + row.id : null
          });
        }
      );
    });
  }

  /**
   * Upgrade subscription from trial to paid plan
   */
  async upgradeFromTrial(userId, newPlan) {
    return new Promise((resolve, reject) => {
      if (!this.PLANS[newPlan]) {
        reject(new Error(`Invalid plan: ${newPlan}`));
        return;
      }

      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      this.db.run(
        `UPDATE subscriptions 
         SET plan = ?, status = ?, subscription_started_at = ?, subscription_expires_at = ?, updated_at = ?
         WHERE user_id = ? AND plan = 'trial'`,
        [newPlan, 'active', now, expiresAt, now, userId],
        function (err) {
          if (err) reject(err);
          else resolve({ plan: newPlan, status: 'active', expiresAt });
        }
      );
    });
  }

  /**
   * Check if feature is available for user's plan
   */
  async canAccessFeature(userId, featureName) {
    const subscription = await this.getSubscription(userId);

    if (!subscription || !subscription.isActive) {
      return false;
    }

    const planFeatures = this.PLANS[subscription.plan]?.features || [];
    return planFeatures.includes('all') || planFeatures.includes(featureName);
  }

  /**
   * Get features available for plan
   */
  getPlanFeatures(plan) {
    return this.PLANS[plan]?.features || [];
  }

  /**
   * Downgrade to free plan when trial expires
   */
  async autoDowngradeExpiredTrials() {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();

      this.db.run(
        `UPDATE subscriptions 
         SET plan = 'free', status = 'active', updated_at = ?
         WHERE plan = 'trial' AND trial_ends_at < ? AND status = 'active'`,
        [now, now],
        function (err) {
          if (err) reject(err);
          else resolve({ downgraded: this.changes });
        }
      );
    });
  }

  /**
   * Renew subscription (for paid plans)
   */
  async renewSubscription(userId, plan) {
    return new Promise((resolve, reject) => {
      if (!['standard', 'pro'].includes(plan)) {
        reject(new Error('Cannot renew non-paid plan'));
        return;
      }

      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      this.db.run(
        `UPDATE subscriptions 
         SET subscription_expires_at = ?, updated_at = ?
         WHERE user_id = ? AND plan = ?`,
        [expiresAt, now, userId, plan],
        function (err) {
          if (err) reject(err);
          else resolve({ plan, expiresAt });
        }
      );
    });
  }
}

module.exports = SubscriptionManager;
