/**
 * OnboardingManager - Handles multi-step user profile collection
 * Stores learning preferences, study habits, and educational background
 */

class OnboardingManager {
  constructor(db) {
    this.db = db;
    this.initTables();
  }

  initTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        name TEXT,
        age INTEGER,
        education_level TEXT,
        program TEXT,
        year_of_study TEXT,
        institution TEXT,
        country TEXT,
        preferred_study_time TEXT,
        attention_span TEXT,
        study_styles TEXT,
        daily_study_hours REAL,
        goals TEXT,
        exams_coming_up TEXT,
        subjects TEXT,
        timezone TEXT,
        phone_notifications INTEGER DEFAULT 1,
        email_notifications INTEGER DEFAULT 1,
        onboarding_completed INTEGER DEFAULT 0,
        completed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS study_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        learning_mode TEXT,
        explanation_level TEXT,
        content_difficulty TEXT,
        focus_areas TEXT,
        notes_format TEXT,
        progress_tracking INTEGER DEFAULT 1,
        spaced_repetition INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS study_goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        goal TEXT NOT NULL,
        target_date TEXT,
        priority TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  }

  /**
   * Initialize onboarding for new user
   */
  initializeOnboarding(userId) {
    return new Promise((resolve, reject) => {
      const id = `profile_${Date.now()}`;
      const now = new Date().toISOString();

      const sql = `
        INSERT INTO user_profiles 
        (id, user_id, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `;

      this.db.run(sql, [id, userId, now, now], (err) => {
        if (err) reject(err);
        else resolve({ profileId: id, initialized: true });
      });
    });
  }

  /**
   * Save Step 1: Basic Info
   */
  saveBasicInfo(userId, data) {
    return new Promise((resolve, reject) => {
      const { name, age, educationLevel, country } = data;
      const now = new Date().toISOString();

      const sql = `
        UPDATE user_profiles 
        SET name = ?, age = ?, education_level = ?, country = ?, updated_at = ?
        WHERE user_id = ?
      `;

      this.db.run(sql, [name, age, educationLevel, country, now, userId], (err) => {
        if (err) reject(err);
        else resolve({ step: 1, saved: true });
      });
    });
  }

  /**
   * Save Step 2: Academic Info
   */
  saveAcademicInfo(userId, data) {
    return new Promise((resolve, reject) => {
      const { program, yearOfStudy, institution } = data;
      const now = new Date().toISOString();

      const sql = `
        UPDATE user_profiles 
        SET program = ?, year_of_study = ?, institution = ?, updated_at = ?
        WHERE user_id = ?
      `;

      this.db.run(sql, [program, yearOfStudy, institution, now, userId], (err) => {
        if (err) reject(err);
        else resolve({ step: 2, saved: true });
      });
    });
  }

  /**
   * Save Step 3: Study Behavior
   */
  saveStudyBehavior(userId, data) {
    return new Promise((resolve, reject) => {
      const {
        preferredStudyTime,
        attentionSpan,
        studyStyles,
        dailyStudyHours,
        timezone,
        phoneNotifications,
        emailNotifications,
      } = data;
      const now = new Date().toISOString();

      const sql = `
        UPDATE user_profiles 
        SET preferred_study_time = ?, attention_span = ?, study_styles = ?, 
            daily_study_hours = ?, timezone = ?, phone_notifications = ?, 
            email_notifications = ?, updated_at = ?
        WHERE user_id = ?
      `;

      this.db.run(
        sql,
        [
          preferredStudyTime,
          attentionSpan,
          JSON.stringify(studyStyles),
          dailyStudyHours,
          timezone,
          phoneNotifications ? 1 : 0,
          emailNotifications ? 1 : 0,
          now,
          userId,
        ],
        (err) => {
          if (err) reject(err);
          else resolve({ step: 3, saved: true });
        }
      );
    });
  }

  /**
   * Save Step 4: Goals & Subjects
   */
  saveGoals(userId, data) {
    return new Promise((resolve, reject) => {
      const { examsComingUp, subjects, goals } = data;
      const now = new Date().toISOString();

      const sql = `
        UPDATE user_profiles 
        SET exams_coming_up = ?, subjects = ?, goals = ?, onboarding_completed = 1, 
            completed_at = ?, updated_at = ?
        WHERE user_id = ?
      `;

      this.db.run(
        sql,
        [
          examsComingUp,
          JSON.stringify(subjects),
          JSON.stringify(goals),
          now,
          now,
          userId,
        ],
        (err) => {
          if (err) reject(err);
          else resolve({ step: 4, saved: true, onboardingComplete: true });
        }
      );
    });
  }

  /**
   * Save study preferences
   */
  saveStudyPreferences(userId, data) {
    return new Promise((resolve, reject) => {
      const {
        learningMode,
        explanationLevel,
        contentDifficulty,
        focusAreas,
        notesFormat,
      } = data;
      const id = `pref_${Date.now()}`;
      const now = new Date().toISOString();

      const sql = `
        INSERT OR REPLACE INTO study_preferences 
        (id, user_id, learning_mode, explanation_level, content_difficulty, 
         focus_areas, notes_format, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(
        sql,
        [
          id,
          userId,
          learningMode,
          explanationLevel,
          contentDifficulty,
          JSON.stringify(focusAreas),
          notesFormat,
          now,
          now,
        ],
        (err) => {
          if (err) reject(err);
          else resolve({ prefId: id, saved: true });
        }
      );
    });
  }

  /**
   * Get complete user profile
   */
  getUserProfile(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT up.*, sp.* FROM user_profiles up
        LEFT JOIN study_preferences sp ON up.user_id = sp.user_id
        WHERE up.user_id = ?
      `;

      this.db.get(sql, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          // Parse JSON fields
          const profile = {
            ...row,
            studyStyles: row.study_styles ? JSON.parse(row.study_styles) : [],
            subjects: row.subjects ? JSON.parse(row.subjects) : [],
            goals: row.goals ? JSON.parse(row.goals) : [],
            focusAreas: row.focus_areas ? JSON.parse(row.focus_areas) : [],
          };
          resolve(profile);
        }
      });
    });
  }

  /**
   * Check if onboarding is complete
   */
  isOnboardingComplete(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT onboarding_completed FROM user_profiles 
        WHERE user_id = ?
      `;

      this.db.get(sql, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.onboarding_completed === 1 : false);
        }
      });
    });
  }

  /**
   * Update profile (general update)
   */
  updateProfile(userId, data) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(data)
        .map((key) => `${this.camelToSnake(key)} = ?`)
        .join(", ");

      const values = Object.values(data);
      values.push(new Date().toISOString());
      values.push(userId);

      const sql = `
        UPDATE user_profiles 
        SET ${fields}, updated_at = ?
        WHERE user_id = ?
      `;

      this.db.run(sql, values, (err) => {
        if (err) reject(err);
        else resolve({ updated: true });
      });
    });
  }

  /**
   * Helper: Convert camelCase to snake_case
   */
  camelToSnake(str) {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /**
   * Create/Update user profile (API endpoint wrapper)
   */
  createProfile(userId, data) {
    return new Promise((resolve, reject) => {
      const { name, age, education_level, program, year_of_study, institution, country, timezone } = data;
      const now = new Date().toISOString();

      const sql = `
        UPDATE user_profiles 
        SET name = ?, age = ?, education_level = ?, program = ?, 
            year_of_study = ?, institution = ?, country = ?, timezone = ?, updated_at = ?
        WHERE user_id = ?
      `;

      this.db.run(
        sql,
        [name, age, education_level, program, year_of_study, institution, country, timezone, now, userId],
        (err) => {
          if (err) reject(err);
          else resolve({ message: "Profile created", userId, data });
        }
      );
    });
  }

  /**
   * Save study preferences (API endpoint wrapper)
   */
  savePreferences(userId, data) {
    return new Promise((resolve, reject) => {
      const { preferred_study_time, attention_span, study_styles, daily_study_hours, goals, exams_coming_up, subjects } = data;
      const now = new Date().toISOString();

      const sql = `
        UPDATE user_profiles 
        SET preferred_study_time = ?, attention_span = ?, study_styles = ?, 
            daily_study_hours = ?, goals = ?, exams_coming_up = ?, subjects = ?, updated_at = ?
        WHERE user_id = ?
      `;

      this.db.run(
        sql,
        [
          preferred_study_time,
          attention_span,
          typeof study_styles === 'string' ? study_styles : JSON.stringify(study_styles),
          daily_study_hours,
          typeof goals === 'string' ? goals : JSON.stringify(goals),
          typeof exams_coming_up === 'string' ? exams_coming_up : JSON.stringify(exams_coming_up),
          typeof subjects === 'string' ? subjects : JSON.stringify(subjects),
          now,
          userId
        ],
        (err) => {
          if (err) reject(err);
          else resolve({ message: "Preferences saved", userId, data });
        }
      );
    });
  }

  /**
   * Get onboarding status for user
   */
  getOnboardingStatus(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT 
          user_id, 
          name, 
          age, 
          education_level, 
          program, 
          onboarding_completed,
          completed_at 
         FROM user_profiles WHERE user_id = ?`,
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve({ status: "not_started", userId });
          } else {
            const progress = [
              row.name ? 1 : 0,
              row.age ? 1 : 0,
              row.education_level ? 1 : 0,
              row.program ? 1 : 0
            ].filter(x => x).length;

            resolve({
              userId,
              status: row.onboarding_completed ? "completed" : "in_progress",
              progress: `${progress}/4`,
              hasName: !!row.name,
              hasAge: !!row.age,
              hasEducation: !!row.education_level,
              hasProgram: !!row.program,
              completedAt: row.completed_at
            });
          }
        }
      );
    });
  }
}

module.exports = OnboardingManager;
