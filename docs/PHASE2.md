# Phase 2 — Storefront redesign

## Assessment of the Phase 1 frontend
React 18 + Vite; one hand-written `styles.css`; no Tailwind / shadcn; `api.js` fetch wrapper with Bearer token;
`Auth` and `Cart` contexts; `useAsync` loader hook; 11 routes. All of that was kept — only the presentation layer changed.

## What was already there vs. new
| Requested | Status |
|---|---|
| Auth, cart logic, API client, routes, order flow | Reused unchanged (cart context gained `imageUrl`) |
| Navbar, hero, categories, product grid, filters, drawer, footer, skeletons, error/empty states | New |
| Tailwind, shadcn-style primitives, Lucide, Inter, Sonner toasts | New |
| Price-range / in-stock / deals filters, discount badges | New (needed a small backend change, below) |
| **Organic** filter, **real favourites** | Not built — see limitations |

## Design system
- Tokens live in **one place**: CSS variables in `src/index.css` (palette from the brief) mapped in `tailwind.config.js`
  (colours, radius, shadows, font). Components use semantic classes (`bg-primary`, `text-muted-foreground`, `bg-soil`…), not hex values.
- Primitives in `src/components/ui/` follow shadcn conventions (Button, Input, Label, Card, Badge, Separator, Skeleton, Alert, Sheet,
  DropdownMenu, Select, Pagination, Sonner toaster). They are hand-authored in JS and compatible with `npx shadcn add` (`components.json` included).
  Dialog and Tabs were deliberately **not** added — nothing needs them yet.
- Font: Inter (self-hosted via `@fontsource-variable/inter`, so no third-party font requests).
- Brand: logo lockups and icons cut from the brand board into `public/brand/` (`logo.png`, `logo-dark.png`, `logo-large.png`,
  `icon-512.png`, `favicon-*.png`, `apple-touch-icon.png`). They are raster; if you have the vector (SVG) originals, swap them in at the same paths.
- Hero photo: set `heroImage` in `src/config/site.js` (file goes in `public/images/`). Until then an illustration is shown.

## Folder structure
`components/{ui,layout,navigation,hero,products,categories,cart,auth,common}`, `hooks/`, `context/` (+ `Favorites`), `config/site.js`, `lib/utils.js`.
Filter state lives in the URL (`/shop?category=…&onSale=1&page=2`) so results are shareable and survive refresh.

## Backend changes (smallest safe set)
- `Product.compareAtPriceCents` (optional "was" price) → discount badge + **Deals**.
- `GET /products` / `/admin/products` accept `minPriceCents`, `maxPriceCents`, `inStock`, `onSale`.
- Admin create/update validates original price > selling price; `null` clears a deal. Admin product form has the new field.
- Tests added for all of the above. Existing endpoints and responses are otherwise unchanged.

## Known limitations / follow-ups
1. ~~Legacy pages~~ — migrated in Phase 3 (see `docs/PHASE3.md`).
2. **Favourites** are stored on the device only; there is no favourites page or backend.
3. **Organic** filter is not offered (products have no such attribute). To add: model field + query param + one checkbox in `FilterPanel`.
4. Dark mode from Phase 1 was removed (the brief's palette is light). Tokens make re-adding it a CSS-only change.
5. The "Deals" query uses `$expr` (not index-assisted). Fine for thousands of products; revisit at much larger scale.
6. Footer social links omitted (none exist). Help/Contact page shows placeholders until `siteConfig.contact` is filled in.
