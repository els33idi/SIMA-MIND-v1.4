SIMA MIND — Admin Panel (Foundation)
===================================

Overview
--------
This repository contains a production-ready foundation for the SIMA MIND Admin Panel. It provides:

- Backend admin API mounted at `/api/admin`
- Admin UI (minimal) served at `/admin`
- Role-based access control (RBAC)
- Secure authentication (bcrypt + JWT) and legacy-hash migration
- Basic MFA (one-time codes) scaffold and endpoints
- Rate limiting (`express-rate-limit`) and `helmet` headers
- Audit logging via `SecurityManager` (`audit_logs` table)

Important environment variables
-------------------------------
- `JWT_SECRET` — server-side JWT secret (also used as pepper)
- `PASSWORD_SALT_ROUNDS` — bcrypt rounds (default 12)
- `PORT` — server port (default 4000)
- `DATABASE_FILE` — path to SQLite DB (default: `sima.db`)
- `REVIEW_ACCOUNT_EMAIL` / `REVIEW_ACCOUNT_PASSWORD` — seeded review account

Running locally
---------------
Install deps and start the server:

```
npm install
npm run dev
```

Access:

- Admin UI: http://localhost:4000/admin
- Admin API base: http://localhost:4000/api/admin

Admin flows
-----------
- Use `/api/auth/login` to obtain a session token; send `Authorization: Bearer <token>` to admin endpoints.
- Admin endpoints:
  - `GET /api/admin/stats`
  - `GET /api/admin/users`
  - `GET /api/admin/users/:id`
  - `POST /api/admin/users`
  - `POST /api/admin/users/:id/role`
  - `POST /api/admin/users/:id/status`
  - `DELETE /api/admin/users/:id` (user deletion)
  - `DELETE /api/admin/users/:id/sessions/:sessionId` (session revoke)
  - `GET /api/admin/users/:id/sessions`
  - `GET /api/admin/users/:id/subscription`
  - `POST /api/admin/users/:id/subscription`
  - `GET /api/admin/users/:id/subscription/history`
  - `GET /api/admin/subscriptions/plans`
  - `GET /api/admin/audit`
  - `GET /api/admin/audit/export`
- Legacy compatibility routes are still supported:
  - `POST /api/admin/users/:id/delete`
  - `POST /api/admin/users/:id/sessions/:sessionId/revoke`
- MFA endpoints: `/api/auth/mfa/setup`, `/api/auth/mfa/confirm`, `/api/auth/mfa/disable`.

Security notes
--------------
- Do not commit `JWT_SECRET` or other production secrets to source control.
- Use a secrets manager for production (AWS Secrets Manager, Azure KeyVault, etc.).
- Replace in-memory rate limiting with Redis-backed store for distributed deployments.
- Terminate TLS at a reverse proxy (NGINX/ALB) and set `X-Forwarded-For` headers.

Next recommended steps
----------------------
- Add TOTP-based MFA (e.g., `otplib`) for longer-lived 2FA, with QR code provisioning.
- Add Redis for session and rate-limit persistence.
- Expand the admin UI into a full SPA with authentication guard and components.
- Implement content, subscriptions, AI config, and analytics admin modules incrementally.

Contact
-------
If you want me to continue (build full UI, TOTP MFA, Redis session store, or integrate Google Play verification webhooks), tell me which feature to prioritize next.
