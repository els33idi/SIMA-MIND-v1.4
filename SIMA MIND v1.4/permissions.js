class PermissionManager {
  constructor(db) {
    this.db = db;
    this.initTables();
    this.defineRoles();
  }

  defineRoles() {
    this.roles = {
      super_admin: {
        permissions: [
          "users:manage",
          "subscriptions:manage",
          "analytics:view",
          "content:manage",
          "support:manage",
          "ai:manage",
          "settings:manage",
          "audit:view",
          "admins:manage",
        ],
      },
      admin: {
        permissions: [
          "users:manage",
          "subscriptions:manage",
          "analytics:view",
          "content:manage",
          "support:view",
          "ai:view",
          "settings:view",
          "audit:view",
        ],
      },
      support_admin: {
        permissions: [
          "users:view",
          "support:manage",
          "subscriptions:view",
          "analytics:view",
        ],
      },
      content_admin: {
        permissions: [
          "content:manage",
          "questions:manage",
          "courses:manage",
          "announcements:manage",
        ],
      },
      analytics_admin: {
        permissions: [
          "analytics:view",
          "errors:view",
          "ai:usage:view",
        ],
      },
      student: {
        permissions: [
          "chat:read",
          "chat:write",
          "groups:read",
          "groups:join",
          "studio:use",
          "payments:view",
          "profile:edit",
        ],
      },
      educator: {
        permissions: [
          "chat:read",
          "chat:write",
          "groups:read",
          "groups:create",
          "groups:moderate",
          "studio:use",
          "payments:view",
          "profile:edit",
          "analytics:view",
        ],
      },
      admin: {
        permissions: [
          "chat:read",
          "chat:write",
          "groups:read",
          "groups:create",
          "groups:moderate",
          "groups:delete",
          "studio:use",
          "payments:view",
          "payments:manage",
          "profile:edit",
          "analytics:view",
          "users:manage",
          "audit:view",
          "encryption:manage",
        ],
      },
      enterprise: {
        permissions: [
          "chat:read",
          "chat:write",
          "groups:read",
          "groups:create",
          "groups:moderate",
          "groups:delete",
          "studio:use",
          "payments:view",
          "payments:manage",
          "profile:edit",
          "analytics:view",
          "users:manage",
          "audit:view",
          "encryption:manage",
          "api:full",
          "custom-ai:access",
        ],
      },
    };
  }

  initTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        granted_at TEXT NOT NULL,
        granted_by TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS group_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        joined_at TEXT NOT NULL,
        FOREIGN KEY (group_id) REFERENCES groups(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS group_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id TEXT NOT NULL,
        member_role TEXT NOT NULL,
        permission TEXT NOT NULL,
        FOREIGN KEY (group_id) REFERENCES groups(id)
      )
    `);
  }

  hasPermission(userRole, permission) {
    const role = this.roles[userRole] || {};
    return (role.permissions || []).includes(permission);
  }

  async checkGroupPermission(userId, groupId, permission) {
    return new Promise((resolve) => {
      this.db.get(
        `SELECT r.role FROM group_members r WHERE r.user_id = ? AND r.group_id = ?`,
        [userId, groupId],
        (err, row) => {
          if (err || !row) {
            resolve(false);
            return;
          }

          this.db.get(
            `SELECT 1 FROM group_permissions WHERE group_id = ? AND member_role = ? AND permission = ?`,
            [groupId, row.role, permission],
            (err, perm) => {
              resolve(!err && !!perm);
            }
          );
        }
      );
    });
  }

  async addUserToGroup(userId, groupId, role = "member") {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      this.db.run(
        `INSERT INTO group_members (user_id, group_id, role, joined_at) VALUES (?, ?, ?, ?)`,
        [userId, groupId, role, now],
        (err) => {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });
  }

  async setGroupMemberRole(groupId, userId, newRole) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?`,
        [newRole, groupId, userId],
        (err) => {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });
  }

  setDefaultGroupPermissions(groupId) {
    const defaultPerms = [
      { role: "owner", permissions: ["chat:read", "chat:write", "moderate:chat", "manage:members", "delete:group"] },
      { role: "moderator", permissions: ["chat:read", "chat:write", "moderate:chat"] },
      { role: "member", permissions: ["chat:read", "chat:write"] },
    ];

    defaultPerms.forEach(({ role, permissions }) => {
      permissions.forEach((permission) => {
        this.db.run(
          `INSERT OR IGNORE INTO group_permissions (group_id, member_role, permission) VALUES (?, ?, ?)`,
          [groupId, role, permission]
        );
      });
    });
  }
}

module.exports = PermissionManager;
