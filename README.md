# GreenMart — Vegetable E-Commerce & Distribution System

Customers browse and order fresh produce; admins manage products, stock, orders and reports.
Stack: **React (Vite) · Node.js/Express · MongoDB (Mongoose)**.

## Quick start (local)

```bash
# 1. MongoDB (or use your own instance)
docker compose up -d 

# 2. API
cd server
cp .env.example .env            # then set JWT_SECRET (>= 32 chars) and ADMIN_PASSWORD (>= 12 chars)
npm install
npm run seed                    # creates the first admin + sample products
npm run dev                     # http://localhost:4000

# 3. Web app (new terminal)
cd client && npm install && npm run dev   # http://localhost:5173 (proxies /api to :4000)
```

Run the tests: `cd server && npm test` (uses an in-memory MongoDB; first run downloads a MongoDB binary).

## Production-style run (Docker)

```bash
cp .env.example .env            # set JWT_SECRET
docker compose up -d --build    # app on http://localhost:8080
docker compose exec -e ADMIN_PASSWORD='a-long-password' server node src/scripts/seed.js
```

Put a TLS-terminating proxy (Caddy, nginx, a cloud load balancer) in front for HTTPS.

## Frontend (Phase 2)
React + Vite + Tailwind CSS + shadcn-style components + Lucide icons. See `docs/PHASE2.md` (design system, brand assets) and `docs/PHASE3.md` (checkout, orders and admin screens).
After pulling Phase 2 run `cd client && npm install` (new dependencies) before `npm run dev` / `npm run build`.

## Features

| Customer | Admin |
|---|---|
| Register / log in | Add, edit, hide (soft-delete) products |
| Browse, search, filter, paginate | Atomic stock adjustments, low-stock report |
| Cart (persisted locally) | View orders, filter by status, advance status |
| Checkout (cash on delivery) | Cancel orders (stock is restored) |
| Order history + progress timeline | Sales / status / top-product reports |
| Printable receipts (print / save as PDF) | |
| In-app order-status notifications | |

## API (`/api/v1`)

Errors always look like `{ "error": { "code", "message", "details?", "requestId" } }`.

| Method & path | Access | Purpose |
|---|---|---|
| POST `/auth/register`, `/auth/login` · GET `/auth/me` | public / user | Accounts (rate-limited) |
| GET `/products`, `/products/categories`, `/products/:id` | public | Catalogue (`q`, `category`, `page`, `limit`) |
| POST `/orders` (+ optional `Idempotency-Key` header) | user | Place order |
| GET `/orders`, `/orders/:id`, `/orders/:id/receipt` | owner | Own orders only |
| POST `/orders/:id/cancel` | owner (pending only) / admin | Cancel |
| GET `/notifications` · POST `/notifications/read-all`, `/:id/read` | user | Status updates |
| GET/POST/PATCH/DELETE `/admin/products…`, POST `/admin/products/:id/stock-adjust` | admin | Catalogue & inventory |
| GET `/admin/orders` · PATCH `/admin/orders/:id/status` | admin | Fulfilment |
| GET `/admin/reports/summary?from&to` | admin | Reports |
| GET `/health`, `/ready` | public | Liveness / readiness |

Order flow: `pending → confirmed → out_for_delivery → delivered`; `pending/confirmed → cancelled`.

## Launch checklist (status)

- [x] Core journeys implemented end to end
- [x] Server-side validation on every endpoint; server-side pricing; no mass-assignment of roles
- [x] AuthN/AuthZ on all protected routes; owner-scoped orders (no IDOR); admin-only routes
- [x] Rate limiting, Helmet headers, CORS allow-list, body size limit, secrets only via env
- [x] Atomic stock reservation, idempotent checkout, conditional status transitions
- [x] Pagination, indexes, structured logs with request IDs (secrets redacted), health checks
- [x] Unit + integration tests, CI pipeline, Dockerfiles, compose file
- [ ] **Run `npm install` and commit the lockfiles**; run `npm run build` in `client/` and click through every page at 320 / 375 / 768 / 1024 / 1280 px, then confirm `npm test` is green in your CI
- [ ] Put HTTPS in front; set a strong `JWT_SECRET`; enable MongoDB auth / managed MongoDB with backups
- [ ] Add error tracking and uptime alerts (e.g. Sentry, UptimeRobot)
- [ ] Manually click through the journeys on a staging deployment, on a phone

## Known limitations / future work

See `docs/DESIGN.md` (assumptions & trade-offs). Out of scope for the MVP: SMS/email notifications,
M-Pesa payments, GPS delivery tracking, mobile app, password reset, refresh tokens.
