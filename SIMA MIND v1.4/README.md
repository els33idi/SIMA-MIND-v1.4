# SIMA MIND Backend

This workspace now includes a dedicated backend server for `index.html` plus a scalable infrastructure blueprint.

## What was added

- `server.js` - Express backend API for groups, enterprise requests, payments, chat proxy, and status.
- `package.json` / `.gitignore` / `.env.example` - backend tooling and configuration.
- Frontend updates in `index.html` to call backend endpoints instead of storing enterprise and group data only locally.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set values:

   ```bash
   copy .env.example .env
   ```

3. Start the backend server:

   ```bash
   npm start
   ```

4. Open the app in your browser:

   ```text
   http://localhost:4000
   ```

## Backend design

### API endpoints

- `GET /api/status` - health check.
- `GET /api/groups` - list saved groups.
- `POST /api/groups` - create a new group.
- `POST /api/enterprise-requests` - submit an enterprise onboarding request.
- `POST /api/payments` - process a payment payload and return a receipt.
- `POST /api/ai` - manage non-chat AI generation requests with backend orchestration.
- `POST /api/chat` - chat endpoint with backend orchestration for AI responses.

### Prototype persistence

The backend uses SQLite for prototype storage in `sima.db`.

### Production infrastructure guidance

For enterprise readiness and 10,000+ users, upgrade this architecture to include:

- Managed relational database: PostgreSQL, MySQL, or Aurora.
- Distributed object storage: S3 / Azure Blob / Google Cloud Storage.
- Secure secrets management: Vault, AWS Secrets Manager, Azure Key Vault.
- API gateway / load balancer for request routing and scaling.
- Caching layer: Redis / Memcached for sessions and frequent data.
- Monitoring / logging: Prometheus, Grafana, DataDog, or cloud-native observability.
- Payment gateway integration: Stripe, Paystack, Flutterwave, bank APIs, Airtel Money / MTN Money secure callbacks.
- Authentication / authorization: OAuth, JWT tokens, MFA, role-based permissions.
- AI orchestration layer: managed model service, prompt logging, safety filters, and usage throttling.

## Next steps

- Replace SQLite with a cloud database for production.
- Integrate a real payment gateway and tokenized card/mobile money flow.
- Add user authentication and a secure session service.
- Migrate AI chat to a managed model service and secure API key storage.
