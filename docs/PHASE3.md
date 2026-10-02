# Phase 3 — Complete the storefront migration

Goal: finish moving every screen onto the Phase 2 design system and delete the temporary `.legacy` layer.

## Migrated pages
| Area | Page | What changed |
|---|---|---|
| Customer | Checkout | Validated form with inline errors, order summary with live totals, idempotent submit, stock-conflict alert linking back to the cart |
| Customer | Orders | Card list, status badges, skeleton / empty / error states, pagination |
| Customer | Order detail | Items table, delivery card, progress timeline, "order placed" confirmation, cancel via dialog (no `window.confirm`) |
| Customer | Receipt | Branded, printable receipt (nav/footer hidden in print) |
| Customer | Order updates | Unread highlighting, mark-all-read, navbar badge refreshes immediately |
| Admin | Orders | Status filter, order cards with call-the-customer link, one-tap status actions, confirm dialog for cancel |
| Admin | Products & stock | Search, responsive table, add/edit dialog with server-error mapping, atomic stock-adjust dialog with live preview, hide/restore |
| Admin | Reports | Date range + quick ranges, stat cards, top-products bars, low-stock list |

## New shared components
`ui/`: Dialog, Table, Textarea · `common/`: ConfirmDialog, StatusBadge (in `orders/`), PageHeader, PageSpinner, RowsSkeleton ·
`orders/`: OrderTimeline, StatusBadge · `admin/`: AdminShell, ProductFormDialog, StockDialog.

## Removed
`components/UI.jsx`, the `Legacy` wrapper, ~60 lines of scoped legacy CSS, and every `window.confirm` / `window.prompt`.

## Behaviour notes
- Backend is **unchanged** in this phase.
- Editing a product no longer overwrites stock; stock changes go through the atomic "Adjust stock" action, so an admin edit can't clobber orders placed at the same moment.
- Admin status buttons mirror the server's allowed transitions; the server stays the authority (a 409 triggers a refresh).

## Still open
- No automated frontend tests yet (the server has unit + API tests). Recommended next: Vitest + Testing Library for cart, checkout validation and the admin dialogs, then Playwright for the order journey.
- Favourites are device-local; no favourites page. Organic filter still unsupported by the backend.
- Not yet built (from the original future-improvements list): M-Pesa payments, SMS notifications, GPS tracking, password reset.
