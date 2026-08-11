class AIOrchestrator {
  constructor(db) {
    this.db = db;
    this.initTables();
    this.defineModels();
  }

  defineModels() {
    this.models = {
      "claude-sonnet": {
        name: "Claude Sonnet",
        maxTokens: 1000,
        costPer1kTokens: 0.003,
        tier: "managed",
        latency: 500,
      },
      "claude-opus": {
        name: "Claude Opus",
        maxTokens: 2000,
        costPer1kTokens: 0.015,
        tier: "premium",
        latency: 800,
      },
      "custom-model-v1": {
        name: "Custom Model v1",
        maxTokens: 1500,
        costPer1kTokens: 0.001,
        tier: "enterprise",
        latency: 300,
      },
      "gpt-4-turbo": {
        name: "GPT-4 Turbo",
        maxTokens: 1000,
        costPer1kTokens: 0.01,
        tier: "managed",
        latency: 600,
      },
    };
  }

  initTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS ai_models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name TEXT UNIQUE NOT NULL,
        tier TEXT,
        status TEXT DEFAULT 'active',
        tokens_limit INTEGER,
        cost_per_1k_tokens REAL,
        created_at TEXT NOT NULL
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS ai_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        subscription_plan TEXT,
        request_type TEXT,
        model_used TEXT,
        tokens_used INTEGER,
        cost REAL,
        latency_ms INTEGER,
        status TEXT DEFAULT 'completed',
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS model_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name TEXT,
        request_type TEXT,
        avg_latency_ms INTEGER,
        accuracy_score REAL,
        uptime_percent REAL,
        updated_at TEXT NOT NULL
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS ai_training_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dataset_name TEXT,
        data_type TEXT,
        num_samples INTEGER,
        status TEXT DEFAULT 'inactive',
        training_status TEXT,
        created_at TEXT NOT NULL
      )
    `);
  }

  selectModel(userSubscription, requestType, latencySensitive = false) {
    const subscriptionTiers = {
      free: ["claude-sonnet"],
      "scholar-lite": ["claude-sonnet"],
      standard: ["claude-sonnet", "claude-opus"],
      scholar: ["claude-sonnet", "claude-opus", "custom-model-v1"],
      enterprise: ["claude-opus", "custom-model-v1", "gpt-4-turbo"],
    };

    const availableModels = subscriptionTiers[userSubscription] || ["claude-sonnet"];

    if (latencySensitive) {
      return availableModels.reduce((best, modelName) => {
        const current = this.models[modelName];
        const bestModel = this.models[best];
        return current.latency < bestModel.latency ? modelName : best;
      });
    }

    // Default: use most capable model available
    const tiers = ["enterprise", "premium", "managed"];
    for (const tier of tiers) {
      const modelInTier = availableModels.find((m) => this.models[m].tier === tier);
      if (modelInTier) return modelInTier;
    }

    return availableModels[0];
  }

  async trackUsage(userId, subscriptionPlan, requestType, model, tokensUsed, latencyMs) {
    return new Promise((resolve) => {
      const modelConfig = this.models[model] || {};
      const cost = ((tokensUsed || 0) / 1000) * (modelConfig.costPer1kTokens || 0);
      const now = new Date().toISOString();

      this.db.run(
        `INSERT INTO ai_usage (user_id, subscription_plan, request_type, model_used, tokens_used, cost, latency_ms, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, subscriptionPlan, requestType, model, tokensUsed, cost, latencyMs, now],
        (err) => {
          resolve(!err);
        }
      );
    });
  }

  async getUsageStats(userId, days = 30) {
    return new Promise((resolve) => {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      this.db.all(
        `SELECT request_type, COUNT(*) as count, SUM(tokens_used) as total_tokens, SUM(cost) as total_cost, AVG(latency_ms) as avg_latency
         FROM ai_usage WHERE user_id = ? AND created_at >= ? GROUP BY request_type`,
        [userId, cutoffDate],
        (err, rows) => {
          resolve(err ? [] : rows);
        }
      );
    });
  }

  async orchestrateRequest(userId, subscriptionPlan, requestType, prompt, latencySensitive = false) {
    const startTime = Date.now();
    const model = this.selectModel(subscriptionPlan, requestType, latencySensitive);

    try {
      // Simulate API call to selected model
      const response = await this._callModel(model, prompt);
      const latency = Date.now() - startTime;
      const estimatedTokens = Math.ceil(prompt.length / 4 + response.length / 4);

      await this.trackUsage(userId, subscriptionPlan, requestType, model, estimatedTokens, latency);

      return {
        response,
        model,
        tokens: estimatedTokens,
        latency,
      };
    } catch (error) {
      console.error("AI orchestration error:", error);
      return {
        response: "Error processing request. Please try again.",
        model,
        error: error.message,
      };
    }
  }

  async _callModel(modelName, prompt) {
    // Placeholder for actual model API calls
    // In production, route to appropriate service:
    // - claude-sonnet/opus → Anthropic API
    // - custom-model-v1 → Custom training endpoint
    // - gpt-4-turbo → OpenAI API

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Model [${modelName}] processed: "${prompt.slice(0, 50)}..."`);
      }, 100);
    });
  }

  async registerTrainingData(datasetName, dataType, numSamples) {
    return new Promise((resolve) => {
      const now = new Date().toISOString();
      this.db.run(
        `INSERT INTO ai_training_data (dataset_name, data_type, num_samples, created_at)
         VALUES (?, ?, ?, ?)`,
        [datasetName, dataType, numSamples, now],
        (err) => {
          resolve(!err);
        }
      );
    });
  }

  async startTraining(datasetName, modelName) {
    return new Promise((resolve) => {
      const now = new Date().toISOString();
      this.db.run(
        `UPDATE ai_training_data SET training_status = 'in_progress', status = 'active' WHERE dataset_name = ?`,
        [datasetName],
        (err) => {
          resolve(!err);
        }
      );
    });
  }

  async getMigrationStatus() {
    return new Promise((resolve) => {
      this.db.all(
        `SELECT dataset_name, training_status, status FROM ai_training_data ORDER BY created_at DESC`,
        (err, rows) => {
          resolve(err ? [] : rows);
        }
      );
    });
  }
}

module.exports = AIOrchestrator;
