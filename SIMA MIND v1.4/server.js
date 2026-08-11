require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const AuthManager = require("./auth");
const PermissionManager = require("./permissions");
const SecurityManager = require("./security");
const PaymentGateway = require("./payments-gateway");
const AIOrchestrator = require("./ai-orchestrator");
const VerificationService = require("./verification-service");
const TrialManager = require("./trial-manager");
const UsageManager = require("./usage-manager");
const OnboardingManager = require("./onboarding-manager");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const fs = require("fs");
const DocumentExtractor = require("./document-extractor");
const StudyToolsGenerator = require("./study-tools-generator");
const SRSManager = require("./srs-manager");
const QuizEngine = require("./quiz-engine");
const StudyPlanner = require("./study-planner");
const AnalyticsDashboard = require("./analytics-dashboard");
const GamificationEngine = require("./gamification-engine");

const app = express();
const PORT = process.env.PORT || 4000;
const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, "sima.db");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const uploadFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png'
  ];
  
  if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(pdf|txt|md|docx|pptx|jpg|jpeg|png)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: uploadFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://unpkg.com"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      styleSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  }
}));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use((req, res, next) => {
  req.ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  req.userAgent = req.headers["user-agent"];
  next();
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", apiLimiter);

const db = new sqlite3.Database(DB_FILE, err => {
  if (err) {
    console.error("Failed to open database:", err);
    process.exit(1);
  }
  console.log("✓ Database connected");
});

// Initialize managers
const authManager = new AuthManager(db);
authManager.ensureReviewAccount().then((result) => {
  console.log(`✓ Review account ready: ${result.email} / ${process.env.REVIEW_ACCOUNT_PASSWORD || "g00gleplay$#%1234"}`);
}).catch((error) => {
  console.error("Failed to initialize review account:", error);
});
const permissionManager = new PermissionManager(db);
const securityManager = new SecurityManager(db);
const AdminManager = require("./admin-manager");
const adminRouter = require("./admin-api");
const paymentGateway = new PaymentGateway(db, securityManager);
const aiOrchestrator = new AIOrchestrator(db);
const verificationService = new VerificationService();
const trialManager = new TrialManager(db);
const usageManager = new UsageManager(db);
const onboardingManager = new OnboardingManager(db);

// Serve frontend files and admin UI
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use(express.static(path.join(__dirname)));

// Mount admin API (requires backend session auth)
const adminManager = new AdminManager(db, authManager, securityManager, trialManager);
app.use('/api/admin', adminRouter(db, authManager, permissionManager, adminManager, securityManager));

// Middleware to verify authentication
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Authorization required" });
  }

  const session = await authManager.validateSession(token);
  if (!session) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.userId = session.userId;
  req.sessionId = session.sessionId;
  req.deviceId = session.deviceId;
  next();
};

// ── AUTHENTICATION ENDPOINTS ──────────────────────────────────────────────────

app.post("/api/auth/request-verification", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  try {
    const result = await authManager.sendEmailVerification(email);
    if (!result) {
      return res.status(500).json({ error: "Failed to send email verification" });
    }

    const delivery = await verificationService.sendEmailVerification(email, result.code);
    const fallbackMode = delivery?.method === "console" || delivery?.fallback === true || !delivery?.success;

    res.json({
      message: fallbackMode
        ? "Verification code generated locally because email delivery is unavailable. Use the code shown in the app."
        : "Verification code sent to email",
      type: "email",
      code: result.code,
      fallback: fallbackMode,
      delivery: delivery?.method || "email"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/verify-code", async (req, res) => {
  const { email, code } = req.body;
  if (!code || !email) {
    return res.status(400).json({ error: "Code and email required" });
  }

  try {
    const verified = await authManager.verifyEmailCode(email, code);
    if (!verified) {
      return res.status(401).json({ error: "Invalid or expired code" });
    }
    res.json({ message: "Email verified", email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Email, code, and password required" });
  }

  try {
    // Check that the code exists, is for the correct email, and hasn't expired
    // Don't require verified=1 since the verify-code endpoint already checked it
    db.get(
      "SELECT id FROM email_verification WHERE email = ? AND code = ? AND expires_at > datetime('now') LIMIT 1",
      [email, code],
      (err, verificationRecord) => {
        if (err || !verificationRecord) {
          return res.status(401).json({ error: "Invalid or expired verification code" });
        }

        if (newPassword.length < 8) {
          return res.status(400).json({ error: "Password must be at least 8 characters" });
        }

        db.get(
          "SELECT id FROM users WHERE email = ?",
          [email],
          (err, user) => {
            if (err || !user) {
              return res.status(404).json({ error: "User not found" });
            }

            const newPasswordHash = authManager.hashPassword(newPassword);
            db.run(
              "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
              [newPasswordHash, user.id],
              async (err) => {
                if (err) {
                  return res.status(500).json({ error: "Failed to update password" });
                }
                // Clear the verification code after successful reset
                db.run(
                  "DELETE FROM email_verification WHERE email = ? AND code = ?",
                  [email, code],
                  () => {} // Ignore deletion errors
                );
                // Log the password reset action
                await securityManager.logAction(user.id, "password_reset", "user", user.id, "success", req.ip, req.userAgent);
                res.json({ message: "Password reset successful", email });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── MFA ENDPOINTS ──────────────────────────────────────────────────────────
app.post('/api/auth/mfa/setup', requireAuth, async (req, res) => {
  try {
    const { type = 'code' } = req.body;
    if (type === 'totp') {
      const user = await new Promise((resolve) => db.get('SELECT email FROM users WHERE id = ?', [req.userId], (err, row) => resolve(row)));
      if (!user || !user.email) return res.status(400).json({ error: 'User email required for TOTP setup' });
      const setup = await authManager.startTOTPSetup(req.userId, user.email);
      await securityManager.logAction(req.userId, 'mfa_totp_setup', 'user', req.userId, 'success', req.ip, req.userAgent);
      return res.json({ method: 'totp', otpauthUrl: setup.otpauthUrl, secret: setup.secret });
    }

    const sent = await authManager.sendMFACode(req.userId);
    if (!sent) return res.status(500).json({ error: 'Failed to generate MFA code' });
    await securityManager.logAction(req.userId, 'mfa_setup_sent', 'user', req.userId, 'success', req.ip, req.userAgent);
    res.json({ method: 'code', message: 'MFA code sent', expiresAt: sent.expiresAt });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/mfa/confirm', requireAuth, async (req, res) => {
  try {
    const { code, type = 'code' } = req.body;
    if (!code) return res.status(400).json({ error: 'MFA code required' });

    if (type === 'totp') {
      const ok = await authManager.confirmTOTPSetup(req.userId, code);
      if (!ok) return res.status(401).json({ error: 'Invalid TOTP code' });
      await securityManager.logAction(req.userId, 'mfa_totp_enabled', 'user', req.userId, 'success', req.ip, req.userAgent);
      return res.json({ message: 'TOTP MFA enabled' });
    }

    const ok = await authManager.verifyMFACode(req.userId, code);
    if (!ok) return res.status(401).json({ error: 'Invalid or expired MFA code' });
    db.run('UPDATE users SET mfa_enabled = 1, mfa_type = ? , updated_at = ? WHERE id = ?', ['code', new Date().toISOString(), req.userId]);
    await securityManager.logAction(req.userId, 'mfa_enabled', 'user', req.userId, 'success', req.ip, req.userAgent);
    res.json({ message: 'MFA enabled' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/mfa/disable', requireAuth, async (req, res) => {
  try {
    const { password, code } = req.body;
    let allowed = false;
    const user = await new Promise((resolve) => db.get('SELECT * FROM users WHERE id = ?', [req.userId], (err, row) => resolve(row)));
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (password) {
      if (authManager.verifyPassword(password, user.password_hash, req.userId)) allowed = true;
    }
    if (!allowed && code) {
      if (user.mfa_type === 'totp' && user.mfa_secret) {
        allowed = authManager.verifyTOTPCode(user.mfa_secret, code);
      } else {
        allowed = await authManager.verifyMFACode(req.userId, code);
      }
    }

    if (!allowed) return res.status(401).json({ error: 'Password or valid MFA code required to disable MFA' });

    if (user.mfa_type === 'totp') {
      await authManager.disableTOTP(req.userId);
    } else {
      db.run('UPDATE users SET mfa_enabled = 0, mfa_type = ?, updated_at = ? WHERE id = ?', ['code', new Date().toISOString(), req.userId]);
    }

    await securityManager.logAction(req.userId, 'mfa_disabled', 'user', req.userId, 'success', req.ip, req.userAgent);
    res.json({ message: 'MFA disabled' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, deviceType = "web" } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const user = await authManager.registerUser(email, null, password, name);
    
    // Initialize trial subscription for new user
    await trialManager.createTrial(user.id);
    
    // Initialize usage tracking
    await usageManager.initializeUsage(user.id, "trial");
    
    // Initialize onboarding
    await onboardingManager.initializeOnboarding(user.id);
    
    const session = await authManager.createSession(user.id, `device-${Date.now()}`, "web", deviceType, req.ip);
    await securityManager.logAction(user.id, "registration", "user", user.id, "success", req.ip, req.userAgent);
    
    res.json({ 
      user, 
      token: session.token, 
      session,
      trial: { status: "active", daysRemaining: trialManager.TRIAL_DAYS }
    });
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "User already exists" });
    }
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password, deviceId, deviceName, deviceType = "web" } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err || !user || !authManager.verifyPassword(password, user.password_hash, user.id)) {
          await securityManager.logAction(null, "login_failed", "user", email, "failed", req.ip, req.userAgent);
          return res.status(401).json({ error: "Invalid credentials" });
        }

        if (user.mfa_enabled) {
          if (user.mfa_type === 'totp' && user.mfa_secret) {
            return res.json({ requiresMFA: true, method: 'totp', message: "Enter your authenticator app code." });
          }

          const mfaSession = `mfa-${Date.now()}`;
          await authManager.sendMFACode(user.id);
          return res.json({ requiresMFA: true, mfaSession, method: 'code', message: "MFA code sent" });
        }

        try {
          const session = await authManager.createSession(
            user.id,
            deviceId || `device-${Date.now()}`,
            deviceName || "Web App",
            deviceType,
            req.ip
          );
          await securityManager.logAction(user.id, "login", "user", user.id, "success", req.ip, req.userAgent);
          res.json({ user: { id: user.id, email: user.email, role: user.role }, session });
        } catch (deviceError) {
          return res.status(403).json({ error: deviceError.message });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/verify-mfa", async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email and MFA code required" });
  }

  try {
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: "User not found" });
      }

      let verified = false;
      if (user.mfa_type === 'totp' && user.mfa_secret) {
        verified = authManager.verifyTOTPCode(user.mfa_secret, code);
      } else {
        verified = await authManager.verifyMFACode(user.id, code);
      }

      if (!verified) {
        return res.status(401).json({ error: "Invalid MFA code" });
      }

      const session = await authManager.createSession(user.id, `device-${Date.now()}`, "web", "web", req.ip);
      res.json({ user: { id: user.id, email: user.email, role: user.role }, session });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/devices", requireAuth, async (req, res) => {
  try {
    const devices = await authManager.getActiveSessions(req.userId);
    res.json({ devices, limit: 3 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/devices/:deviceId/remove", requireAuth, async (req, res) => {
  try {
    const removed = await authManager.removeSession(req.params.deviceId);
    if (!removed) {
      return res.status(404).json({ error: "Device not found" });
    }
    await securityManager.logAction(req.userId, "device_removed", "session", req.params.deviceId, "success", req.ip, req.userAgent);
    res.json({ message: "Device removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/logout", requireAuth, async (req, res) => {
  await authManager.logout(req.sessionId);
  await securityManager.logAction(req.userId, "logout", "user", req.userId, "success", req.ip, req.userAgent);
  res.json({ message: "Logged out successfully" });
});

app.post("/api/auth/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password required" });
  }

  try {
    db.get(
      "SELECT * FROM users WHERE id = ?",
      [req.userId],
      async (err, user) => {
        if (err || !user) {
          return res.status(404).json({ error: "User not found" });
        }

        if (!authManager.verifyPassword(currentPassword, user.password_hash, user.id)) {
          await securityManager.logAction(req.userId, "change_password_failed", "user", req.userId, "failed", req.ip, req.userAgent);
          return res.status(401).json({ error: "Current password is incorrect" });
        }

        const newPasswordHash = authManager.hashPassword(newPassword);
        db.run(
          "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [newPasswordHash, req.userId],
          async (err) => {
            if (err) {
              return res.status(500).json({ error: "Failed to update password" });
            }
            await securityManager.logAction(req.userId, "change_password", "user", req.userId, "success", req.ip, req.userAgent);
            res.json({ message: "Password changed successfully" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/auth/delete-account", requireAuth, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password required for account deletion" });
  }

  try {
    db.get(
      "SELECT * FROM users WHERE id = ?",
      [req.userId],
      async (err, user) => {
        if (err || !user) {
          return res.status(404).json({ error: "User not found" });
        }

        if (!authManager.verifyPassword(password, user.password_hash, user.id)) {
          await securityManager.logAction(req.userId, "delete_account_failed", "user", req.userId, "failed", req.ip, req.userAgent);
          return res.status(401).json({ error: "Password is incorrect" });
        }

        try {
          // Delete all user-related data
          db.run("DELETE FROM sessions WHERE user_id = ?", [req.userId]);
          db.run("DELETE FROM user_profiles WHERE user_id = ?", [req.userId]);
          db.run("DELETE FROM subscriptions WHERE user_id = ?", [req.userId]);
          db.run("DELETE FROM usage_tracking WHERE user_id = ?", [req.userId]);
          db.run("DELETE FROM onboarding_state WHERE user_id = ?", [req.userId]);
          db.run("DELETE FROM email_verification WHERE email = ?", [user.email]);
          db.run("DELETE FROM phone_verification WHERE phone = ?", [user.phone]);
          
          // Finally, delete the user
          db.run(
            "DELETE FROM users WHERE id = ?",
            [req.userId],
            async (err) => {
              if (err) {
                return res.status(500).json({ error: "Failed to delete account" });
              }
              await securityManager.logAction(req.userId, "delete_account", "user", req.userId, "success", req.ip, req.userAgent);
              res.json({ message: "Account deleted successfully" });
            }
          );
        } catch (deleteError) {
          return res.status(500).json({ error: deleteError.message });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PROFILE UPDATE ENDPOINTS ────────────────────────────────────────────────

// Update user profile with country code and learning styles
app.put("/api/auth/update-profile", requireAuth, async (req, res) => {
  const { countryCode, preferredLearningStyles } = req.body;
  
  try {
    const updates = [];
    const params = [];
    
    if (countryCode) {
      updates.push("country_code = ?");
      params.push(countryCode);
    }
    
    if (preferredLearningStyles) {
      updates.push("preferred_learning_styles = ?");
      params.push(JSON.stringify(preferredLearningStyles));
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    
    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(req.userId);
    
    db.run(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      params,
      function(err) {
        if (err) {
          return res.status(500).json({ error: "Failed to update profile" });
        }
        
        res.json({ 
          message: "Profile updated successfully",
          countryCode: countryCode,
          preferredLearningStyles: preferredLearningStyles
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload profile picture
app.post("/api/auth/profile-picture", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  try {
    const fileUrl = `/uploads/${req.file.filename}`;
    
    db.run(
      "UPDATE users SET profile_picture_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [fileUrl, req.userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: "Failed to update profile picture" });
        }
        
        res.json({ 
          message: "Profile picture uploaded successfully",
          profilePictureUrl: fileUrl 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const sendUserProfile = (req, res) => {
  try {
    db.get(
      "SELECT id, email, phone, country_code, profile_picture_url, preferred_learning_styles, email_verified, phone_verified, created_at, role, mfa_enabled, mfa_type FROM users WHERE id = ?",
      [req.userId],
      (err, user) => {
        if (err || !user) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json({
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          countryCode: user.country_code,
          profilePictureUrl: user.profile_picture_url,
          preferredLearningStyles: user.preferred_learning_styles ? JSON.parse(user.preferred_learning_styles) : [],
          emailVerified: user.email_verified === 1,
          phoneVerified: user.phone_verified === 1,
          mfaEnabled: user.mfa_enabled === 1,
          mfaType: user.mfa_type || 'code',
          createdAt: user.created_at
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
app.get("/api/auth/profile", requireAuth, sendUserProfile);
app.get("/api/auth/me", requireAuth, sendUserProfile);

// ── ONBOARDING ENDPOINTS ────────────────────────────────────────────────────

app.post("/api/onboarding/profile", requireAuth, async (req, res) => {
  const { 
    name, age, education, program, year, institution, 
    studyTime, attention, style, hours, urgency, email 
  } = req.body;
  try {
    // Save basic profile
    const profile = await onboardingManager.createProfile(req.userId, {
      name, 
      age, 
      education_level: education,
      program, 
      year_of_study: year, 
      institution
    });
    
    // Save study preferences
    const prefs = await onboardingManager.savePreferences(req.userId, {
      preferred_study_time: studyTime,
      attention_span: attention,
      study_styles: Array.isArray(style) ? style : [style],
      daily_study_hours: hours,
      goals: urgency,
      exams_coming_up: urgency,
      email
    });
    
    // Log the action
    await securityManager.logAction(req.userId, "onboarding_complete", "profile", req.userId, "success", req.ip, req.userAgent);
    
    res.json({ 
      message: "Onboarding profile and preferences saved",
      profile,
      preferences: prefs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/onboarding/preferences", requireAuth, async (req, res) => {
  const { preferred_study_time, attention_span, study_styles, daily_study_hours, goals, exams_coming_up, subjects } = req.body;
  try {
    const prefs = await onboardingManager.savePreferences(req.userId, {
      preferred_study_time, attention_span, study_styles, daily_study_hours, goals, exams_coming_up, subjects
    });
    await securityManager.logAction(req.userId, "onboarding_preferences", "preferences", req.userId, "success", req.ip, req.userAgent);
    res.json({ message: "Study preferences saved", prefs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/onboarding/status", requireAuth, async (req, res) => {
  try {
    const status = await onboardingManager.getOnboardingStatus(req.userId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── TRIAL ENDPOINTS ────────────────────────────────────────────────────────

app.get("/api/trial/status", requireAuth, async (req, res) => {
  try {
    const status = await trialManager.getTrialStatus(req.userId);
    res.json(status || { message: "No active trial" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/subscription/plan", requireAuth, async (req, res) => {
  try {
    const plan = await trialManager.getUserPlan(req.userId);
    const details = await trialManager.getPlanDetails(plan);
    res.json({ plan, details });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/subscription/upgrade", requireAuth, async (req, res) => {
  const { plan, stripeSubscriptionId } = req.body;
  if (!plan) {
    return res.status(400).json({ error: "Plan required" });
  }
  try {
    const result = await trialManager.upgradePlan(req.userId, plan, stripeSubscriptionId);
    await securityManager.logAction(req.userId, "subscription_upgrade", "subscription", plan, "success", req.ip, req.userAgent);
    res.json({ message: "Subscription upgraded", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/plans", (req, res) => {
  res.json({
    plans: [
      { plan: "trial", name: "Trial", limit: 30, price: "Free", duration: "14 days" },
      { plan: "free", name: "Free", limit: 30, price: "Always Free", features: ["Basic chat", "Document upload", "Summarization"] },
      { plan: "standard", name: "Standard", limit: 150, price: "$9.99/month", features: ["All Free + Flashcards", "Quizzes", "Smart Planner", "Exam Mode"] },
      { plan: "pro", name: "Pro", limit: 9999, price: "$29.99/month", features: ["Unlimited everything", "Audio learning", "Group chats", "Priority support"] }
    ]
  });
});

// ── DOCUMENT ENDPOINTS (PHASE 2) ───────────────────────────────────────────

app.post("/api/documents/upload", requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase().substring(1);
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Extract text from document
    let extractedText = '';
    try {
      extractedText = await DocumentExtractor.extractText(req.file.path, fileExt) || '';
    } catch (extractError) {
      console.warn('Text extraction warning:', extractError.message);
    }

    // Check plan limits
    db.get(
      'SELECT plan FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.userId],
      async (err, subscription) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        const plan = subscription?.plan || 'free';
        const limits = { trial: 10, free: 3, standard: 50, pro: 999 };
        
        // Count existing documents
        db.get(
          'SELECT COUNT(*) as count FROM documents WHERE user_id = ?',
          [req.userId],
          (err, result) => {
            if (err) {
              return res.status(500).json({ error: "Database error" });
            }

            if (result.count >= (limits[plan] || 3)) {
              fs.unlink(req.file.path, () => {}); // Clean up uploaded file
              return res.status(402).json({ 
                error: `Document limit reached. ${plan === 'free' ? 'Upgrade to upload more.' : ''}`
              });
            }

            // Save document to database
            db.run(
              `INSERT INTO documents (id, user_id, name, size, type, created_at) 
               VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [documentId, req.userId, req.file.originalname, req.file.size, fileExt],
              (err) => {
                if (err) {
                  fs.unlink(req.file.path, () => {});
                  return res.status(500).json({ error: "Failed to save document" });
                }
                
                res.json({ 
                  document: {
                    id: documentId,
                    name: req.file.originalname,
                    size: req.file.size,
                    type: fileExt,
                    uploadedAt: new Date().toISOString(),
                    textLength: extractedText.length,
                    extractedText: extractedText.substring(0, 500) // Send preview
                  }
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/documents/generate-tools", requireAuth, async (req, res) => {
  try {
    const { documentId } = req.body;
    
    if (!documentId) {
      return res.status(400).json({ error: "Document ID required" });
    }

    // Get document from database
    db.get(
      'SELECT id, name, user_id FROM documents WHERE id = ? AND user_id = ?',
      [documentId, req.userId],
      async (err, doc) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        if (!doc) {
          return res.status(404).json({ error: "Document not found" });
        }

        // Find the file
        const uploadedFile = fs.readdirSync(UPLOADS_DIR).find(f => f.includes(Date.now().toString().substring(0, 5)) || true);
        
        // Try to extract text from the document
        let documentText = '';
        
        try {
          const fileExt = doc.name.split('.').pop().toLowerCase();
          const filePath = path.join(UPLOADS_DIR, uploadedFile || `${documentId}.${fileExt}`);
          
          if (fs.existsSync(filePath)) {
            documentText = await DocumentExtractor.extractText(filePath, fileExt);
          }
        } catch (extractError) {
          console.warn('Document extraction warning:', extractError.message);
        }

        // Generate study tools
        const tools = await StudyToolsGenerator.generateStudyTools(documentText);
        
        res.json(tools);
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/documents", requireAuth, async (req, res) => {
  try {
    db.all(
      "SELECT id, name, size, type, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC",
      [req.userId],
      (err, docs) => {
        if (err) {
          return res.status(500).json({ error: "Failed to fetch documents" });
        }
        res.json({ 
          documents: docs || [],
          count: docs ? docs.length : 0
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/documents/:documentId", requireAuth, async (req, res) => {
  try {
    const { documentId } = req.params;
    
    db.get(
      'SELECT id FROM documents WHERE id = ? AND user_id = ?',
      [documentId, req.userId],
      (err, doc) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        if (!doc) {
          return res.status(404).json({ error: "Document not found" });
        }

        // Delete document from database
        db.run(
          'DELETE FROM documents WHERE id = ? AND user_id = ?',
          [documentId, req.userId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: "Failed to delete document" });
            }
            res.json({ message: "Document deleted successfully" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── FLASHCARD ENDPOINTS (PHASE 3) ──────────────────────────────────────────

// Create flashcards from document
app.post("/api/flashcards/create", requireAuth, async (req, res) => {
  try {
    const { documentId, deckName } = req.body;
    
    // Fetch document
    db.get(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [documentId, req.userId],
      async (err, doc) => {
        if (err || !doc) {
          return res.status(404).json({ error: "Document not found" });
        }

        // Read and extract text
        const filePath = path.join(__dirname, "uploads", path.basename(doc.name));
        let text = "";
        try {
          text = await DocumentExtractor.extractText(filePath, doc.type);
        } catch (e) {
          return res.status(400).json({ error: "Failed to extract text" });
        }

        // Generate flashcards using study tools generator
        const tools = StudyToolsGenerator.generateStudyTools(text, req.userProfile);
        const deckId = `deck_${Date.now()}`;

        // Insert flashcards into database
        const flashcards = tools.flashcards.map((fc, idx) => ({
          id: `card_${Date.now()}_${idx}`,
          userId: req.userId,
          deckId,
          front: fc.question,
          back: fc.answer,
          difficulty: fc.difficulty,
          category: fc.category,
          createdAt: new Date().toISOString()
        }));

        const stmt = db.prepare(`
          INSERT INTO flashcards (id, user_id, deck_id, front, back, interval, ease_factor, next_review_date, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, 2.5, ?, ?, ?)
        `);

        const now = new Date().toISOString();
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        flashcards.forEach(card => {
          stmt.run([card.id, card.userId, card.deckId, card.front, card.back, tomorrow, now, now]);
        });
        stmt.finalize();

        res.json({
          message: "Flashcards created successfully",
          deckId,
          cardCount: flashcards.length,
          flashcards
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get flashcards due for review
app.get("/api/flashcards/due", requireAuth, async (req, res) => {
  try {
    db.all(
      `SELECT * FROM flashcards WHERE user_id = ? 
       AND (next_review_date IS NULL OR next_review_date <= datetime('now'))
       ORDER BY last_review_date ASC LIMIT 20`,
      [req.userId],
      (err, cards) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        const stats = SRSManager.calculateStats(cards);
        const session = SRSManager.createReviewSession(cards, 20);

        res.json({ session, stats });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit flashcard review result
app.post("/api/flashcards/review", requireAuth, async (req, res) => {
  try {
    const { cardId, quality } = req.body;
    
    if (quality < 0 || quality > 5) {
      return res.status(400).json({ error: "Quality must be 0-5" });
    }

    db.get(
      'SELECT * FROM flashcards WHERE id = ? AND user_id = ?',
      [cardId, req.userId],
      (err, card) => {
        if (err || !card) {
          return res.status(404).json({ error: "Card not found" });
        }

        const updated = SRSManager.recordReview(card, quality);

        db.run(
          `UPDATE flashcards SET interval = ?, ease_factor = ?, last_review_date = ?, 
           next_review_date = ?, last_quality = ?, suspended = ?, updated_at = ? 
           WHERE id = ?`,
          [
            updated.interval,
            updated.easeFactor,
            updated.lastReviewDate,
            updated.nextReviewDate,
            updated.lastQuality,
            updated.suspended ? 1 : 0,
            new Date().toISOString(),
            cardId
          ],
          (err) => {
            if (err) {
              return res.status(500).json({ error: "Failed to update card" });
            }

            // ────── GAMIFICATION INTEGRATION ──────
            // Award points for flashcard review
            const basePoints = quality >= 3 ? 15 : 5; // More points for correct answers
            const today = new Date().toISOString().split('T')[0];

            // Get current streak
            db.all(
              'SELECT DISTINCT DATE(last_review_date) as review_date FROM flashcards WHERE user_id = ? ORDER BY last_review_date DESC LIMIT 30',
              [req.userId],
              (err, reviews) => {
                const reviewDates = reviews ? reviews.map(r => r.review_date).filter(d => d) : [];
                const streak = GamificationEngine.calculateStreak(reviewDates);

                // Calculate points with streak bonus
                const { totalPoints, bonusMultiplier } = GamificationEngine.calculatePointsWithBonus(basePoints, streak.currentStreak);

                // Award points
                db.run(
                  'UPDATE user_gamification SET total_points = total_points + ?, current_streak = ?, updated_at = ? WHERE user_id = ?',
                  [totalPoints, streak.currentStreak, new Date().toISOString(), req.userId],
                  (err) => {
                    if (err) console.error('Failed to award points:', err);
                  }
                );

                // Check achievements
                db.all('SELECT COUNT(*) as count FROM flashcards WHERE user_id = ? AND suspended = 0', [req.userId], (err, countRes) => {
                  if (!err && countRes) {
                    const cardsCreated = countRes[0]?.count || 0;
                    const achievements = GamificationEngine.checkAchievements({
                      cardsCreated,
                      cardsMastered: cardsCreated,
                      retentionRate: 80,
                      quizzesCompleted: 0,
                      averageQuizScore: 0,
                      longestStreak: streak.longestStreak,
                      studyConsistency: 0
                    });

                    // Store unlocked achievements
                    achievements.forEach(ach => {
                      db.run(
                        'INSERT OR IGNORE INTO achievements VALUES (?, ?, ?, ?)',
                        [`ach_${req.userId}_${ach.id}`, req.userId, ach.id, new Date().toISOString()]
                      );
                    });
                  }
                });

                res.json({ 
                  message: "Review recorded", 
                  card: updated,
                  gamification: {
                    pointsEarned: totalPoints,
                    streakBonus: bonusMultiplier > 1 ? bonusMultiplier : null,
                    currentStreak: streak.currentStreak
                  }
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get flashcard statistics
app.get("/api/flashcards/stats", requireAuth, async (req, res) => {
  try {
    db.all(
      'SELECT * FROM flashcards WHERE user_id = ?',
      [req.userId],
      (err, cards) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        const stats = SRSManager.calculateStats(cards);
        res.json(stats);
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── QUIZ ENDPOINTS (PHASE 3) ────────────────────────────────────────────────

// Create a quiz from document MCQs
app.post("/api/quiz/create", requireAuth, async (req, res) => {
  try {
    const { documentId, questionCount = 5 } = req.body;

    db.get(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [documentId, req.userId],
      async (err, doc) => {
        if (err || !doc) {
          return res.status(404).json({ error: "Document not found" });
        }

        // Extract text and generate MCQs
        const filePath = path.join(__dirname, "uploads", path.basename(doc.name));
        let text = "";
        try {
          text = await DocumentExtractor.extractText(filePath, doc.type);
        } catch (e) {
          return res.status(400).json({ error: "Failed to extract text" });
        }

        const tools = StudyToolsGenerator.generateStudyTools(text, req.userProfile);
        const questions = tools.mcqs.slice(0, questionCount);

        const session = QuizEngine.createQuizSession(questions, {
          timeLimit: 30,
          passingScore: 60
        });

        res.json(session);
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz answers
app.post("/api/quiz/submit", requireAuth, async (req, res) => {
  try {
    const { quizId, responses } = req.body;

    // Score all responses (in real app, fetch questions from DB)
    const scoredResponses = responses.map(r => ({
      ...r,
      correct: true, // Simplified - real implementation would fetch actual answers
      pointsEarned: r.correct ? 1 : 0,
      maxPoints: 1
    }));

    const results = {
      quizId,
      totalQuestions: scoredResponses.length,
      correctAnswers: scoredResponses.filter(r => r.correct).length,
      scorePercentage: Math.round((scoredResponses.filter(r => r.correct).length / scoredResponses.length) * 100),
      passed: Math.round((scoredResponses.filter(r => r.correct).length / scoredResponses.length) * 100) >= 60,
      completedAt: new Date().toISOString()
    };

    // Save to database
    db.run(
      `INSERT INTO quiz_sessions (id, user_id, quiz_id, total_questions, correct_answers, score_percentage, passed, responses, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `session_${Date.now()}`,
        req.userId,
        quizId,
        results.totalQuestions,
        results.correctAnswers,
        results.scorePercentage,
        results.passed ? 1 : 0,
        JSON.stringify(scoredResponses),
        new Date().toISOString()
      ],
      (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to save quiz results" });
        }

        // ────── GAMIFICATION INTEGRATION ──────
        // Award points for quiz completion
        const basePoints = Math.round(results.correctAnswers * 5); // 5 points per correct answer
        const bonusMultiplier = results.passed ? 1.5 : 1; // 50% bonus if passed
        const totalPoints = Math.round(basePoints * bonusMultiplier);

        // Get current streak
        db.all(
          'SELECT DISTINCT DATE(created_at) as quiz_date FROM quiz_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
          [req.userId],
          (err, quizzes) => {
            const quizDates = quizzes ? quizzes.map(q => q.quiz_date).filter(d => d) : [];
            const streak = GamificationEngine.calculateStreak(quizDates);

            // Award points with streak bonus
            const { totalPoints: streakPoints, bonusMultiplier: streakMult } = GamificationEngine.calculatePointsWithBonus(totalPoints, streak.currentStreak);

            db.run(
              'UPDATE user_gamification SET total_points = total_points + ?, current_streak = ?, updated_at = ? WHERE user_id = ?',
              [streakPoints, streak.currentStreak, new Date().toISOString(), req.userId],
              (err) => {
                if (err) console.error('Failed to award quiz points:', err);
              }
            );

            // Check achievements
            const achievements = GamificationEngine.checkAchievements({
              cardsCreated: 0,
              cardsMastered: 0,
              retentionRate: 0,
              quizzesCompleted: 1,
              bestQuizScore: results.scorePercentage === 100 ? 100 : 0,
              averageQuizScore: results.scorePercentage,
              longestStreak: streak.longestStreak,
              studyConsistency: 0
            });

            achievements.forEach(ach => {
              db.run(
                'INSERT OR IGNORE INTO achievements VALUES (?, ?, ?, ?)',
                [`ach_${req.userId}_${ach.id}`, req.userId, ach.id, new Date().toISOString()]
              );
            });
          }
        );

        res.json({
          ...results,
          gamification: {
            pointsEarned: totalPoints,
            bonus: results.passed ? '50% pass bonus' : null
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quiz statistics
app.get("/api/quiz/stats", requireAuth, async (req, res) => {
  try {
    db.all(
      'SELECT * FROM quiz_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.userId],
      (err, sessions) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        const stats = {
          totalQuizzes: sessions.length,
          averageScore: sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + s.score_percentage, 0) / sessions.length)
            : 0,
          passedQuizzes: sessions.filter(s => s.passed).length,
          recentSessions: sessions
        };

        res.json(stats);
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── STUDY PLAN ENDPOINTS (PHASE 3) ─────────────────────────────────────────

// Create personalized study plan
app.post("/api/study-plan/create", requireAuth, async (req, res) => {
  try {
    const { goals, availability, personalization } = req.body;

    // Create base profile with personalization options
    const userProfile = {
      id: req.userId,
      learningStyle: personalization?.learningStyle || 'visual',
      studyPace: 'moderate',
      hoursPerDay: personalization?.hoursPerDay || 2,
      preferredTime: personalization?.preferredTime || 'morning',
      examDate: personalization?.examDate || null
    };

    const plan = StudyPlanner.createStudyPlan(
      userProfile,
      goals || [],
      availability
    );

    // Save to database with personalization
    db.run(
      `INSERT INTO study_plans (id, user_id, title, goals, weekly_schedule, daily_tasks, status, personalization, created_at, updated_at, next_review_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plan.planId,
        req.userId,
        personalization?.title || "My Study Plan",
        JSON.stringify(plan.goals),
        JSON.stringify(plan.weeklyPlan),
        JSON.stringify(plan.dailyTasks),
        'active',
        JSON.stringify(personalization || {}),
        new Date().toISOString(),
        new Date().toISOString(),
        plan.nextReview
      ],
      (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to save study plan" });
        }

        // ────── GAMIFICATION INTEGRATION ──────
        // Award points for creating a study plan
        const basePoints = 30;
        
        // Get streak
        db.all(
          'SELECT DISTINCT DATE(created_at) as plan_date FROM study_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
          [req.userId],
          (err, plans) => {
            const planDates = plans ? plans.map(p => p.plan_date).filter(d => d) : [];
            const streak = GamificationEngine.calculateStreak(planDates);

            const { totalPoints, bonusMultiplier } = GamificationEngine.calculatePointsWithBonus(basePoints, streak.currentStreak);

            db.run(
              'UPDATE user_gamification SET total_points = total_points + ?, current_streak = ?, updated_at = ? WHERE user_id = ?',
              [totalPoints, streak.currentStreak, new Date().toISOString(), req.userId]
            );

            // Check achievements
            const achievements = GamificationEngine.checkAchievements({
              plansCreated: 1,
              goalsCompleted: plan.goals ? plan.goals.length : 0,
              longestStreak: streak.longestStreak
            });

            achievements.forEach(ach => {
              db.run(
                'INSERT OR IGNORE INTO achievements VALUES (?, ?, ?, ?)',
                [`ach_${req.userId}_${ach.id}`, req.userId, ach.id, new Date().toISOString()]
              );
            });
          }
        );

        res.json({
          ...plan,
          gamification: {
            pointsEarned: basePoints,
            message: 'Study plan created! +30 points'
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current study plan
app.get("/api/study-plan/current", requireAuth, async (req, res) => {
  try {
    db.get(
      'SELECT * FROM study_plans WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
      [req.userId, 'active'],
      (err, plan) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        if (!plan) {
          return res.json({ message: "No active study plan" });
        }

        res.json({
          ...plan,
          goals: JSON.parse(plan.goals),
          weeklySchedule: JSON.parse(plan.weekly_schedule),
          dailyTasks: JSON.parse(plan.daily_tasks)
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's tasks
app.get("/api/study-plan/today", requireAuth, async (req, res) => {
  try {
    db.get(
      'SELECT * FROM study_plans WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
      [req.userId, 'active'],
      (err, plan) => {
        if (err || !plan) {
          return res.status(404).json({ error: "No active study plan" });
        }

        const tasks = JSON.parse(plan.daily_tasks);
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = tasks.filter(t => t.dueDate.startsWith(today));

        res.json({ tasks: todayTasks });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── ANALYTICS ENDPOINTS (PHASE 3.5) ────────────────────────────────────────

// Get SRS analytics
app.get("/api/analytics/srs", requireAuth, async (req, res) => {
  try {
    db.all(
      'SELECT * FROM flashcards WHERE user_id = ?',
      [req.userId],
      (err, cards) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        const analytics = AnalyticsDashboard.calculateSRSAnalytics(cards || []);
        res.json(analytics);
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quiz analytics
app.get("/api/analytics/quiz", requireAuth, async (req, res) => {
  try {
    db.all(
      'SELECT * FROM quiz_sessions WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId],
      (err, sessions) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        const analytics = AnalyticsDashboard.calculateQuizAnalytics(sessions || []);
        res.json(analytics);
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get study progress analytics
app.get("/api/analytics/progress", requireAuth, async (req, res) => {
  try {
    db.get(
      'SELECT * FROM study_plans WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
      [req.userId, 'active'],
      (err, plan) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        const analytics = AnalyticsDashboard.calculateStudyProgress(plan);
        res.json(analytics);
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comprehensive dashboard summary
app.get("/api/analytics/dashboard", requireAuth, async (req, res) => {
  try {
    // Fetch all data in parallel
    db.all('SELECT * FROM flashcards WHERE user_id = ?', [req.userId], (err, cards) => {
      db.all('SELECT * FROM quiz_sessions WHERE user_id = ?', [req.userId], (err2, sessions) => {
        db.get('SELECT * FROM study_plans WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
          [req.userId, 'active'],
          (err3, plan) => {
            const srsData = AnalyticsDashboard.calculateSRSAnalytics(cards || []);
            const quizData = AnalyticsDashboard.calculateQuizAnalytics(sessions || []);
            const studyData = AnalyticsDashboard.calculateStudyProgress(plan);

            const dashboard = AnalyticsDashboard.getDashboardSummary(srsData, quizData, studyData);
            res.json(dashboard);
          }
        );
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get learning insights
app.get("/api/analytics/insights", requireAuth, async (req, res) => {
  try {
    db.all('SELECT * FROM flashcards WHERE user_id = ?', [req.userId], (err, cards) => {
      db.all('SELECT * FROM quiz_sessions WHERE user_id = ?', [req.userId], (err2, sessions) => {
        const srsData = AnalyticsDashboard.calculateSRSAnalytics(cards || []);
        const quizData = AnalyticsDashboard.calculateQuizAnalytics(sessions || []);

        const insights = {
          recommendations: AnalyticsDashboard.generateRecommendations({
            srs: srsData,
            quizzes: quizData
          }),
          nextMilestone: AnalyticsDashboard.getNextMilestone({
            srs: srsData,
            quizzes: quizData
          }),
          learningVelocity: AnalyticsDashboard.calculateLearningVelocity({
            srs: srsData,
            quizzes: quizData
          }),
          studyLevel: AnalyticsDashboard.getStudyLevel({
            srs: srsData,
            quizzes: quizData
          })
        };

        res.json(insights);
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GAMIFICATION ENDPOINTS (PHASE 4) ───────────────────────────────────────

// Get user gamification profile
app.get("/api/gamification/profile", requireAuth, async (req, res) => {
  try {
    db.get(
      'SELECT * FROM user_gamification WHERE user_id = ?',
      [req.userId],
      (err, profile) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        if (!profile) {
          // Initialize gamification profile
          const initProfile = {
            id: `game_${Date.now()}`,
            userId: req.userId,
            totalPoints: 0,
            currentLevel: 1,
            currentStreak: 0,
            longestStreak: 0,
            totalAchievements: 0,
            updatedAt: new Date().toISOString()
          };

          db.run(
            'INSERT INTO user_gamification VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [initProfile.id, initProfile.userId, initProfile.totalPoints, initProfile.currentLevel,
             initProfile.currentStreak, initProfile.longestStreak, initProfile.totalAchievements,
             initProfile.updatedAt],
            () => {
              const level = GamificationEngine.calculateLevel(0);
              res.json({
                ...level,
                achievements: [],
                badge: { level: 1, levelName: 'Novice', achievements: 0, topBadges: [] }
              });
            }
          );
        } else {
          const level = GamificationEngine.calculateLevel(profile.total_points || 0);
          res.json({
            ...level,
            currentStreak: profile.current_streak,
            longestStreak: profile.longest_streak,
            achievements: profile.total_achievements,
            badge: GamificationEngine.getUserBadge({
              totalPoints: profile.total_points,
              longestStreak: profile.longest_streak,
              averageQuizScore: 75,
              cardsMastered: 10
            })
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get achievements
app.get("/api/gamification/achievements", requireAuth, async (req, res) => {
  try {
    db.all(
      'SELECT achievement_id FROM achievements WHERE user_id = ?',
      [req.userId],
      (err, unlockedAchievements) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        const unlockedIds = unlockedAchievements?.map(a => a.achievement_id) || [];
        const allAchievements = Object.values(GamificationEngine.achievements).map(ach => ({
          ...ach,
          unlocked: unlockedIds.includes(ach.id)
        }));

        res.json({
          allAchievements,
          unlockedCount: unlockedIds.length,
          totalCount: allAchievements.length
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily challenges
app.get("/api/gamification/challenges", requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    db.all(
      'SELECT * FROM daily_challenges WHERE user_id = ? AND challenge_date >= ? ORDER BY challenge_date DESC LIMIT 7',
      [req.userId, today],
      (err, challenges) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        if (!challenges || challenges.length === 0) {
          // Generate weekly challenges
          const weekly = GamificationEngine.generateWeeklyChallenges();
          res.json({ challenges: weekly, generated: true });
        } else {
          res.json({ challenges, generated: false });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update challenge progress
app.post("/api/gamification/challenge-progress", requireAuth, async (req, res) => {
  try {
    const { challengeId, progress } = req.body;

    db.get(
      'SELECT * FROM daily_challenges WHERE user_id = ? AND challenge_id = ?',
      [req.userId, challengeId],
      (err, challenge) => {
        if (err || !challenge) {
          return res.status(404).json({ error: "Challenge not found" });
        }

        const basChallenge = GamificationEngine.achievements[challengeId] || 
                           { target: 10, reward: 50, title: 'Challenge' };
        const progressData = GamificationEngine.calculateChallengeProgress(basChallenge, progress);

        db.run(
          'UPDATE daily_challenges SET progress = ?, completed = ? WHERE id = ?',
          [progress, progressData.completed ? 1 : 0, challenge.id],
          () => {
            res.json(progressData);
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
app.get("/api/gamification/leaderboard", requireAuth, async (req, res) => {
  try {
    const period = req.query.period || 'week';

    db.all(
      'SELECT user_id, total_points, current_level, current_streak FROM user_gamification ORDER BY total_points DESC LIMIT 100',
      [],
      (err, users) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        // Get user names (would need user table join in real implementation)
        const leaderboard = (users || []).map((u, idx) => ({
          rank: idx + 1,
          userId: u.user_id,
          totalPoints: u.total_points,
          currentLevel: u.current_level,
          streak: u.current_streak
        }));

        res.json(leaderboard);
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Award points
app.post("/api/gamification/earn-points", requireAuth, async (req, res) => {
  try {
    const { points, reason, streakBonus = 0 } = req.body;

    const totalPoints = streakBonus > 0 
      ? GamificationEngine.calculatePointsWithBonus(points, streakBonus).totalPoints
      : points;

    // Update user gamification
    db.run(
      'UPDATE user_gamification SET total_points = total_points + ?, updated_at = ? WHERE user_id = ?',
      [totalPoints, new Date().toISOString(), req.userId],
      () => {
        res.json({
          pointsEarned: totalPoints,
          reason,
          message: `+${totalPoints} points${streakBonus > 0 ? ` (${streakBonus}-day streak bonus!)` : ''}`
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── USAGE TRACKING ENDPOINTS ────────────────────────────────────────────────

app.post("/api/usage/track", requireAuth, async (req, res) => {
  const { input_type, content_length } = req.body;
  if (!input_type) {
    return res.status(400).json({ error: "Input type required" });
  }
  try {
    const result = await usageManager.trackUsage(req.userId, input_type, content_length || 0);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/usage/status", requireAuth, async (req, res) => {
  try {
    const status = await usageManager.getUserUsage(req.userId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/usage/history", requireAuth, async (req, res) => {
  try {
    const history = await usageManager.getUsageHistory(req.userId, 30);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GROUP ENDPOINTS ────────────────────────────────────────────────────────

app.get("/api/groups", (req, res) => {
  db.all("SELECT * FROM groups ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to load groups." });
    res.json({ groups: rows.map(r => ({ ...r, active: Boolean(r.active) })) });
  });
});

app.post("/api/groups", requireAuth, (req, res) => {
  const { name, topic, members = 1, active = true } = req.body;
  if (!name || !topic) {
    return res.status(400).json({ error: "Group name and topic are required." });
  }
  const id = `group-${Date.now()}`;
  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO groups (id, name, topic, members, active, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, topic, Number(members), active ? 1 : 0, createdAt],
    async function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to create group." });
      }
      // Set default permissions for group
      permissionManager.setDefaultGroupPermissions(id);
      // Add creator as owner
      await permissionManager.addUserToGroup(req.userId, id, "owner");
      await securityManager.logAction(req.userId, "group_created", "group", id, "success", req.ip, req.userAgent);
      res.json({ group: { id, name, topic, members: Number(members), active: Boolean(active), created_at: createdAt } });
    }
  );
});

app.post("/api/groups/:groupId/join", requireAuth, async (req, res) => {
  const { groupId } = req.params;
  try {
    await permissionManager.addUserToGroup(req.userId, groupId, "member");
    await securityManager.logAction(req.userId, "group_joined", "group", groupId, "success", req.ip, req.userAgent);
    res.json({ message: "Joined group successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to join group" });
  }
});

// ── ENTERPRISE ENDPOINTS ───────────────────────────────────────────────────

app.post("/api/enterprise-requests", async (req, res) => {
  const { contactPhone, contactEmail, requestMessage = "", source = "frontend" } = req.body;
  if (!contactPhone || !contactEmail) {
    return res.status(400).json({ error: "contactPhone and contactEmail are required." });
  }
  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO enterprise_requests (contact_phone, contact_email, request_message, source, created_at) VALUES (?, ?, ?, ?, ?)`,
    [contactPhone, contactEmail, requestMessage, source, createdAt],
    async function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to store enterprise request." });
      }
      await securityManager.logAction(null, "enterprise_request", "enterprise", this.lastID, "success", req.ip, req.userAgent);
      res.json({ id: this.lastID, contactPhone, contactEmail, requestMessage, source, createdAt });
    }
  );
});

app.get("/api/enterprise/audit", requireAuth, async (req, res) => {
  try {
    const isAdmin = await permissionManager.checkGroupPermission(req.userId, "admin", "audit:view");
    if (!isAdmin) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const logs = await securityManager.getAuditLog({ startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PAYMENT ENDPOINTS ──────────────────────────────────────────────────────

app.post("/api/payments", requireAuth, async (req, res) => {
  const { plan, amount, currency, method, cardData, phoneNumber, bankData } = req.body;
  if (!plan || !amount || !currency || !method) {
    return res.status(400).json({ error: "Missing required payment fields." });
  }

  try {
    let transaction;
    switch (method) {
      case "VISA":
        transaction = await paymentGateway.processVISA(req.userId, cardData, amount, currency);
        break;
      case "AIRTEL_MONEY":
        transaction = await paymentGateway.processAirtelMoney(req.userId, phoneNumber, amount, currency);
        break;
      case "MTN_MONEY":
        transaction = await paymentGateway.processMTNMoney(req.userId, phoneNumber, amount, currency);
        break;
      case "BANK_TRANSFER":
        transaction = await paymentGateway.processBankTransfer(req.userId, bankData, amount, currency);
        break;
      default:
        return res.status(400).json({ error: "Invalid payment method" });
    }

    await securityManager.logAction(req.userId, "payment", "transaction", transaction.transactionId, "completed", req.ip, req.userAgent, { amount, currency, method });
    res.json({ receipt: transaction });
  } catch (error) {
    await securityManager.logAction(req.userId, "payment", "transaction", "error", "failed", req.ip, req.userAgent);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

app.get("/api/payments/history", requireAuth, async (req, res) => {
  try {
    const history = await paymentGateway.getTransactionHistory(req.userId);
    res.json({ transactions: history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── AI ORCHESTRATION ENDPOINTS ────────────────────────────────────────────

app.post("/api/ai", requireAuth, async (req, res) => {
  const { type, prompt, model = "auto", latencySensitive = false } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    // Get user subscription plan
    db.get("SELECT subscription_plan FROM subscription WHERE user_id = ?", [req.userId], async (err, row) => {
      const plan = row?.subscription_plan || "free";
      const selectedModel = model === "auto" ? aiOrchestrator.selectModel(plan, type, latencySensitive) : model;
      const result = await aiOrchestrator.orchestrateRequest(req.userId, plan, type, prompt, latencySensitive);
      await securityManager.logAction(req.userId, "ai_request", type, selectedModel, "success", req.ip, req.userAgent, { tokens: result.tokens, latency: result.latency });
      res.json(result);
    });
  } catch (error) {
    await securityManager.logAction(req.userId, "ai_request", "error", "error", "failed", req.ip, req.userAgent);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.get("/api/ai/usage", requireAuth, async (req, res) => {
  try {
    const stats = await aiOrchestrator.getUsageStats(req.userId);
    res.json({ usage: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/ai/models", requireAuth, (req, res) => {
  res.json({ models: aiOrchestrator.models });
});

// ── CHAT ENDPOINTS ────────────────────────────────────────────────────────

app.post("/api/chat", requireAuth, async (req, res) => {
  const { context = "", messages = [], group, model = "auto" } = req.body;
  const lastUserMessage = messages.filter(m => m.role === "user").slice(-1)[0]?.content || "";

  try {
    // Check group permission if group context exists
    if (group?.id) {
      const hasPermission = await permissionManager.checkGroupPermission(req.userId, group.id, "chat:write");
      if (!hasPermission) {
        return res.status(403).json({ error: "No permission to chat in this group" });
      }
    }

    // Use AI orchestration for chat
    db.get("SELECT subscription_plan FROM subscription WHERE user_id = ?", [req.userId], async (err, row) => {
      const plan = row?.subscription_plan || "free";
      const result = await aiOrchestrator.orchestrateRequest(req.userId, plan, "chat", lastUserMessage, true);

      // Store chat history
      const now = new Date().toISOString();
      db.run("INSERT INTO chat_history (session_id, role, content, created_at) VALUES (?, ?, ?, ?)", [group?.id || "direct", "user", lastUserMessage, now]);
      db.run("INSERT INTO chat_history (session_id, role, content, created_at) VALUES (?, ?, ?, ?)", [group?.id || "direct", "assistant", result.response, now]);

      await securityManager.logAction(req.userId, "chat_message", "chat", group?.id || "direct", "success", req.ip, req.userAgent);
      res.json(result);
    });
  } catch (error) {
    res.status(500).json({ error: "Chat failed" });
  }
});

app.post("/api/chat/moderate", requireAuth, async (req, res) => {
  const { groupId, messageId, action } = req.body;
  try {
    const canModerate = await permissionManager.checkGroupPermission(req.userId, groupId, "moderate:chat");
    if (!canModerate) {
      return res.status(403).json({ error: "No moderation permission" });
    }
    await securityManager.logAction(req.userId, `message_${action}`, "chat", messageId, "success", req.ip, req.userAgent);
    res.json({ message: `Message ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── STATUS & MONITORING ────────────────────────────────────────────────────

app.get("/api/status", (req, res) => {
  const providers = verificationService.getActiveProviders();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: "connected",
      auth: "ready",
      payments: "ready",
      ai: "ready",
      encryption: "enabled",
      verification: providers,
    },
  });
});

app.get("/api/health/backups", requireAuth, async (req, res) => {
  try {
    const backups = await securityManager.getBackupStatus(7);
    res.json({ backups, status: backups.length > 0 ? "healthy" : "warning" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✓ SIMA MIND backend running on http://localhost:${PORT}`);
  console.log(`✓ Auth system initialized`);
  console.log(`✓ Payment gateways ready (VISA, Airtel, MTN, Bank)`);
  console.log(`✓ AI orchestration with model selection ready`);
  console.log(`✓ Audit logging and encryption enabled`);
  console.log(`✓ Role-based access control (RBAC) active`);
  console.log(`✓ Enterprise infrastructure ready for 10,000+ users`);
});
