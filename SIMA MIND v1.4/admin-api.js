const express = require("express");

function adminRouter(db, authManager, permissionManager, adminManager, securityManager) {
  const router = express.Router();

  // RBAC middleware
  const requireRole = (roles = []) => async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Missing token" });
      const session = await authManager.validateSession(token);
      if (!session) return res.status(401).json({ error: "Invalid session" });
      const user = await adminManager.getUserById(session.userId);
      if (!user) return res.status(403).json({ error: "Access denied" });

      // allow if user role is in roles or user is super_admin
      if (roles.length === 0 || roles.includes(user.role) || user.role === "super_admin") {
        req.admin = user;
        next();
      } else {
        return res.status(403).json({ error: "Insufficient role" });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  };

  router.get("/stats", requireRole(["admin", "analytics_admin", "super_admin"]), async (req, res) => {
    try {
      const stats = await adminManager.getStats();
      res.json({ stats });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/users", requireRole(["admin", "support_admin", "super_admin"]), async (req, res) => {
    try {
      const { q, limit = 50, offset = 0 } = req.query;
      const users = await adminManager.getUsers({ search: q, limit: parseInt(limit, 10), offset: parseInt(offset, 10) });
      res.json({ users });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/users/:id", requireRole(["admin", "support_admin", "super_admin"]), async (req, res) => {
    try {
      const user = await adminManager.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ user });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post("/users", requireRole(["super_admin", "admin", "support_admin"]), async (req, res) => {
    try {
      const { email, password, role = 'student', status = 'active', phone } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });
      const user = await adminManager.createUser({ email, password, role, status, phone });
      res.json({ user });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post("/users/:id/role", requireRole(["super_admin", "admin"]), async (req, res) => {
    try {
      const { role } = req.body;
      if (!role) return res.status(400).json({ error: "Role required" });
      await adminManager.setUserRole(req.params.id, role, req.admin?.id);
      res.json({ message: "Role updated" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post("/users/:id/status", requireRole(["super_admin", "admin", "support_admin"]), async (req, res) => {
    try {
      const { status, reason } = req.body;
      if (!status) return res.status(400).json({ error: "Status required" });
      await adminManager.setUserStatus(req.params.id, status, req.admin?.id, reason);
      res.json({ message: "Status updated" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/users/:id/sessions", requireRole(["super_admin", "admin", "support_admin"]), async (req, res) => {
    try {
      const sessions = await adminManager.getUserSessions(req.params.id);
      res.json({ sessions });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.delete("/users/:id/sessions/:sessionId", requireRole(["super_admin", "admin", "support_admin"]), async (req, res) => {
    try {
      const revoked = await adminManager.revokeSession(req.params.sessionId, req.admin?.id);
      if (!revoked) return res.status(404).json({ error: "Session not found" });
      res.json({ message: "Session revoked" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Fallback compatibility route for older admin clients
  router.post("/users/:id/sessions/:sessionId/revoke", requireRole(["super_admin", "admin", "support_admin"]), async (req, res) => {
    try {
      const revoked = await adminManager.revokeSession(req.params.sessionId, req.admin?.id);
      if (!revoked) return res.status(404).json({ error: "Session not found" });
      res.json({ message: "Session revoked" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/users/:id/subscription", requireRole(["super_admin", "admin", "support_admin"]), async (req, res) => {
    try {
      const subscription = await adminManager.getSubscriptionByUserId(req.params.id);
      res.json({ subscription });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/subscriptions/plans", requireRole(["super_admin", "admin", "support_admin"]), async (req, res) => {
    try {
      const plans = await adminManager.getSubscriptionPlans();
      res.json({ plans });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post("/users/:id/subscription", requireRole(["super_admin", "admin"]), async (req, res) => {
    try {
      const { plan } = req.body;
      if (!plan) return res.status(400).json({ error: "Plan required" });
      await adminManager.setUserSubscription(req.params.id, plan, req.admin?.id);
      res.json({ message: "Subscription updated" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/users/:id/subscription/history", requireRole(["super_admin", "admin", "support_admin"]), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit || "20", 10);
      const offset = parseInt(req.query.offset || "0", 10);
      const history = await adminManager.getSubscriptionHistory(req.params.id, limit, offset);
      res.json({ history });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/audit/export", requireRole(["super_admin", "admin"]), async (req, res) => {
    try {
      const filters = {
        startDate: req.query.start,
        endDate: req.query.end,
        userId: req.query.userId,
        action: req.query.action,
        status: req.query.status,
        limit: parseInt(req.query.limit || "1000", 10),
        offset: parseInt(req.query.offset || "0", 10)
      };
      const logs = await securityManager.getAuditLog(filters);
      const normalized = ['Time', 'User', 'Action', 'Resource', 'Status', 'Details'];
      const rows = [
        normalized.join(','),
        ...logs.map(log => [
          log.created_at,
          log.user_id || 'system',
          log.action,
          `${log.resource_type || '-'} ${log.resource_id || ''}`.trim(),
          log.status || '-',
          JSON.stringify(log.details || '')
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      ];
      res.setHeader('Content-Type', 'text/csv');
      res.send(rows.join('\n'));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/audit", requireRole(["super_admin", "admin"]), async (req, res) => {
    try {
      const filters = {
        startDate: req.query.start,
        endDate: req.query.end,
        userId: req.query.userId,
        action: req.query.action,
        status: req.query.status,
        limit: parseInt(req.query.limit || "25", 10),
        offset: parseInt(req.query.offset || "0", 10)
      };
      const logs = await securityManager.getAuditLog(filters);
      res.json({ logs });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.delete("/users/:id", requireRole(["super_admin", "admin"]), async (req, res) => {
    try {
      const deleted = await adminManager.deleteUser(req.params.id, req.admin?.id);
      if (!deleted) return res.status(404).json({ error: "User not found" });
      res.json({ message: "User deleted" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Fallback compatibility route for older admin clients
  router.post("/users/:id/delete", requireRole(["super_admin", "admin"]), async (req, res) => {
    try {
      const deleted = await adminManager.deleteUser(req.params.id, req.admin?.id);
      if (!deleted) return res.status(404).json({ error: "User not found" });
      res.json({ message: "User deleted" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
}

module.exports = adminRouter;
