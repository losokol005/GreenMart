# GreenMart — Requirements, Assumptions & Architecture

## Phase 1 — Requirements

**Functional** (from the project brief): registration/login; browse & search products; cart and ordering;
order history; receipts; admin product CRUD, inventory, order processing, reports; order-status notifications.

**Non-functional:** Security (protect data & auth) · Performance (indexed, paginated queries) ·
Scalability (stateless API, horizontal scaling behind a proxy) · Usability (responsive, accessible UI) ·
Data integrity (no overselling, immutable price snapshots) · Observability (structured logs, health checks).

**Constraints:** React front end, Node.js back end, MongoDB (per brief).

## Assumptions (the brief did not specify these — change them if wrong)

1. **Payment = cash on delivery.** M-Pesa is listed as a *future* improvement, so it is not built. An order becomes "paid" when marked delivered.
2. **Currency = KES.** Prices are stored as integer minor units (`priceCents`) to avoid floating-point errors.
3. **Delivery fee** is a single flat amount from `DELIVERY_FEE_CENTS` (default 0). No zones or distance pricing.
4. **Notifications are in-app** (bell/Alerts page). SMS/e-mail are future work.
5. **Receipts** are generated from the order and shown as a printable page (browser print / save as PDF); no PDF library needed.
6. **Single role per user** (`customer` or `admin`). Public sign-up always creates customers; the first admin is created with `npm run seed`.
7. **Deleting a product hides it** (soft delete) so past orders and receipts stay intact.
8. **Customers may cancel only while an order is pending**; after that they contact the store.
9. Quantities are whole numbers (e.g. 2 kg, 3 bunches), not fractional weights.

## Architecture

```
React SPA (Vite) ──HTTPS──► nginx ──/api──► Express API ──► MongoDB
                                  └─ static assets
```

Boring, proven choices: Express + Mongoose + Zod (validation) + JWT (HS256) + bcrypt (cost 12).

Key decisions and trade-offs:

- **Stock safety without transactions.** Each line is reserved with `updateOne({stock: {$gte: qty}}, {$inc: …})`; if any line fails, earlier reservations are released. This avoids needing a MongoDB replica set. A crash between reservation and order creation could leak stock (rare; fix by moving to multi-document transactions on a replica set).
- **Idempotent checkout.** A unique partial index on `(user, idempotencyKey)` plus an `Idempotency-Key` header makes double-clicks and retries safe.
- **Status changes are conditional updates** (`findOneAndUpdate` on the current status), so concurrent admin actions cannot both succeed.
- **Auth token** is a Bearer JWT kept in `localStorage` (12 h expiry). Simple and immune to CSRF, but readable by injected scripts; React escapes output and Helmet is enabled, but if you later render user HTML, move to an httpOnly cookie + CSRF protection. Users are re-loaded on each request, so deactivation/role changes apply immediately. No refresh tokens or password reset yet.
- **Search** uses an escaped, case-insensitive regex on product name — fine for hundreds/thousands of products; switch to a text/Atlas index if the catalogue grows large.
- **Price snapshots** (name, unit, price) are stored on each order line.
- **Customer-visible errors** never include stack traces; every response carries `requestId` for log correlation.
