# React performance audit

Audited `main` at `7f997a6` on 2026-08-03 against Vercel's React best-practices guide. Generated GraphQL code was excluded except at bundle boundaries.

## Baseline

A production build with replayed WordPress fixtures compiled and typechecked successfully. Next's bundle diagnostics report:

| Route               | First-load JS, uncompressed |
| ------------------- | --------------------------: |
| ordinary site route |                   760,335 B |
| `/produkt/[slug]`   |                   790,379 B |
| `/[[...slug]]`      |                   802,975 B |

The optional catch-all adds 42,640 B over an ordinary route. Its two route-specific chunks total 12,264 B gzip. The six chunks attached to the shared site layout total 94,924 B gzip; this is a baseline, not an estimate of removable code.

After remediation, the same fixture-backed production build reports:

| Route               | First-load JS, uncompressed | Change from comparable baseline |
| ------------------- | --------------------------: | ------------------------------: |
| ordinary site route |                   753,893 B |                        −6,442 B |
| `/`                 |                   779,505 B |                       −23,470 B |
| `/[...slug]`        |                   768,674 B |                       −34,301 B |
| `/produkt/[slug]`   |                   784,903 B |                        −5,476 B |

## Findings and remediation

### P1 — Split the homepage from the content catch-all

Rules: `bundle-conditional`, `bundle-dynamic-imports`.

Status: resolved.

The optional catch-all imported both homepage and WordPress template clients, giving each route the other's interactive code. The homepage now lives in [`src/app/(site)/page.tsx`](<../src/app/(site)/page.tsx>), content uses the required [`[...slug]`](<../src/app/(site)/%5B...slug%5D/page.tsx>) route, and the lightbox loads after gallery interaction. Route-level splitting is restored and unopened dialog code stays out of initial JS.

### P1 — Do not ship the complete cart sheet to every visitor

Rules: `bundle-conditional`, `bundle-dynamic-imports`.

Status: resolved.

The shared layout previously included the dialog, cart editor, totals, and their dependencies for every visitor. It now mounts a small [`CartTrigger`](../src/components/Cart/CartTrigger.tsx) bootstrap and dynamically imports the full sheet only for a non-empty or explicitly opened cart. Document order, focus return, and no-JavaScript links remain intact.

### P1 — Avoid the checkout request for empty carts

Rule: `async-defer-await`.

Status: resolved.

The cart page now fetches the cart first and skips the rate-limited checkout query for empty carts. If non-empty-cart latency later matters, the cart query can return both values in one WordPress round trip.

### P2 — Bypass large package barrels

Rule: `bundle-barrel-imports`.

Status: resolved.

Six client modules previously imported icons through Hugeicons' 6.0 MB ESM index, and the button imported `Slot` through the Radix aggregate. All now use exported per-module paths; the production build verifies those paths without extra configuration.

### P2 — Narrow cart-store subscriptions

Rules: `rerender-derived-state`, `rerender-defer-reads`.

Status: resolved.

The product form now subscribes only to referentially stable cart lines. Opening, closing, or loading the sheet no longer makes it recompute product variation state.

### P3 — Version, validate, and cache consent storage

Rules: `client-localstorage-schema`, `js-cache-storage`.

Status: resolved.

Consent now uses `bf-consent:v1`, validates both accepted values, migrates the legacy key, and caches the loaded choice in the module store. Route changes still recount or reveal parked embeds without another storage read.

## Already good

- Independent homepage, news, sitemap, and cart operations use `Promise.all`.
- Content metadata/body share a `cache()`-wrapped query with primitive arguments.
- LQIP work deduplicates URLs and batches independent image operations.
- Base UI imports use direct component subpaths.
- The single delegated consent listener is mounted once and cleaned up.
- Content routes use static generation/ISR, limiting repeated server work.

## Validation

- `bun run test`
- `bun run lint`
- `bunx playwright test --workers=1`
- `MOCK_WP=replay NEXT_DIST_DIR=.next-audit bunx next build`

All commands completed against replayed fixtures. No production deployment or production mutation was performed.
