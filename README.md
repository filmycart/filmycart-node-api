# Filmycart Node.js E-Commerce REST API

Standalone Express + Sequelize + MySQL 8 backend for Filmycart. Designed to work with a React/Next.js storefront or an existing Laravel frontend.

## Requirements
- Node.js 20+ (Node 24 recommended), npm
- MySQL 8
- Git

## Features
- Customer registration/login, JWT access + rotating refresh tokens, logout, current-user endpoint
- Product and category catalogue; admin-only catalogue management
- Authenticated cart and wishlist
- Transactional checkout with stock validation/decrement and order snapshots
- Razorpay order creation, signature verification and raw-body webhook confirmation
- Admin dashboard and order status endpoint
- Request validation, Helmet, CORS allowlist, rate limiting, compression, structured JSON errors
- Sequelize migrations/seed, Jest/Supertest health test, GitHub Actions CI, PM2 and Docker deployment examples

## 1. Install
```bash
cp .env.example .env
npm install
```
Edit `.env`. Use long, random JWT secrets (e.g. `openssl rand -hex 48`). Set `FRONTEND_URL` to the exact frontend origin(s), comma-separated.

## 2. Create MySQL database/user
Run as a MySQL administrator:
```sql
CREATE DATABASE filmycart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'filmycart_user'@'localhost' IDENTIFIED BY 'REPLACE_WITH_STRONG_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON filmycart_db.* TO 'filmycart_user'@'localhost';
FLUSH PRIVILEGES;
```
Set matching `DB_*` values in `.env`.

## 3. Migrate and seed admin
```bash
SEED_ADMIN_EMAIL=admin@yourdomain.com SEED_ADMIN_PASSWORD='Use-A-Strong-Unique-Password' npm run db:seed
npm run db:migrate
```
Run migrations before seed if your Sequelize CLI setup expects tables first; recommended order is `npm run db:migrate` then `npm run db:seed`. Change the seeded password immediately after first login. Never use the sample seed password in production.

## 4. Start
```bash
npm run dev       # development
npm start         # production
curl http://localhost:5000/api/health
```
`DB_SYNC=true` is an optional development-only shortcut; do not use `sequelize.sync({ alter: true })` in production. Use migrations.

## API base
`http://localhost:5000/api/v1` (Swagger UI: `http://localhost:5000/api/docs`)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register customer |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/refresh` | Refresh token | Rotate refresh token |
| GET | `/auth/me` | JWT | Current user |
| POST | `/auth/logout` | JWT | Revoke refresh token |
| GET | `/products`, `/products/:id-or-slug` | Public | Browse/search products |
| POST/PUT/DELETE | `/products` and `/products/:id` | Admin | Manage products |
| GET | `/categories` | Public | List categories |
| POST/PUT | `/categories` and `/categories/:id` | Admin | Manage categories |
| GET/POST | `/cart` | JWT | Read/add cart item |
| PATCH/DELETE | `/cart/:id` | JWT | Update/remove cart item |
| GET/POST | `/wishlist` | JWT | Read/add wishlist |
| DELETE | `/wishlist/:productId` | JWT | Remove wishlist item |
| POST | `/orders/checkout` | JWT | Place order from cart |
| GET | `/orders`, `/orders/:id` | JWT | Customer orders; admin can list all |
| POST | `/payments/razorpay/:orderId` | JWT | Create Razorpay checkout order |
| POST | `/payments/razorpay/verify` | JWT | Verify checkout signature (not final paid state) |
| POST | `/payments/razorpay/webhook` | Razorpay | Confirm capture/failure from signed webhook |
| GET | `/admin/dashboard` | Admin | Basic metrics |
| GET | `/admin/users` | Admin | List users (up to 200) |
| PATCH | `/admin/users/:id/status` | Admin | Activate/block user |
| PATCH | `/admin/orders/:id/status` | Admin | Update fulfilment status |

## Authentication
Send `Authorization: Bearer <accessToken>`. Access tokens are short-lived. Store refresh tokens securely (prefer an HttpOnly, Secure, SameSite cookie in a browser integration; this starter accepts the refresh token in request JSON, so do not store it in localStorage for production browser apps). Add CSRF protection if moving refresh tokens to cookies.

## Razorpay setup
1. Create/test your Razorpay account and configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
2. Configure webhook URL: `https://api.yourdomain.com/api/v1/payments/razorpay/webhook`.
3. Subscribe to `payment.captured` and `payment.failed`.
4. Frontend opens Razorpay Checkout with returned `keyId`, `razorpayOrderId`, `amount`, `currency`.
5. Send checkout callback fields to `/payments/razorpay/verify`; the API checks signature. Treat webhook `payment.captured` as authoritative for setting `paymentStatus=paid`.

Do not accept amount, currency, order ownership, or payment status from the browser as authoritative. Use HTTPS in production. Add webhook event idempotency and refund workflow before enabling live payments.

## Testing
```bash
npm test
npm audit
```
CI uses MySQL 8 and Node 24. Extend integration tests for auth, inventory race conditions, permissions, checkout and payment webhooks before production.

## GitHub
```bash
git init
git add .
git commit -m "Initial Filmycart Node.js API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/filmycart-node-api.git
git push -u origin main
```
GitHub Actions runs on push and pull request. Configure repository secrets only for deployment workflows; never commit `.env`.

## Ubuntu 24.04 + PM2 + Nginx deployment
```bash
sudo apt update && sudo apt install -y nginx git
# Install Node.js 24 using NodeSource or your approved Node.js package source.
sudo npm install -g pm2
sudo mkdir -p /var/www/filmycart-api
sudo chown -R "$USER":"$USER" /var/www/filmycart-api
cd /var/www/filmycart-api
git clone https://github.com/YOUR_USERNAME/filmycart-node-api.git .
npm install --omit=dev
cp .env.example .env
nano .env
npm run db:migrate
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
Configure `nginx/filmycart-api.conf` with your real API domain, enable it in `/etc/nginx/sites-available/`, symlink to `sites-enabled`, then `sudo nginx -t && sudo systemctl reload nginx`. Issue TLS using Certbot after DNS points to the server.

## Docker
Set `MYSQL_ROOT_PASSWORD` in the environment and configure `.env`, then:
```bash
docker compose up -d --build
```
For production, use secrets management, persistent backups, a private database network, health checks, and run migrations as a release step rather than automatically on every API start.

## Important production hardening still required
- Add idempotency keys and webhook event storage to prevent duplicate payment/order processing.
- Implement refund/cancellation stock-restoration workflows and shipping/tax/discount calculation rules.
- Add address management, email/SMS notifications, audit logs, image upload storage (S3-compatible), pagination caps, and API observability as required.
- Add product/category uniqueness and ownership checks for your actual catalogue rules.
- Configure TLS, backups, least-privilege DB grants, secret rotation, dependency scanning, and monitoring.
- Review legal/tax/privacy requirements for your operating regions.

This is a deployable starter foundation, not a certification of production readiness. Review and test all business rules against Filmycart's actual schema before connecting live traffic.

## GitHub Actions deployment
The optional `.github/workflows/deploy.yml` deploys on pushes to `main` and manual dispatch. Add these repository Actions secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` (private key), `DEPLOY_PATH` (absolute application directory), and optionally `DEPLOY_PORT`. Provision the directory and PM2 app on the server first, ensure the deploy user can run Node/npm/PM2 and access the repository, and keep `.env` on the server (never in Git). Test the workflow against staging before enabling production deployment. Pin third-party Actions to reviewed commit SHAs in high-security environments.
