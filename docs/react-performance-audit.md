# React performance audit

Audited `main` at `7f997a6` on 2026-08-03 against Vercel's React best-practices guide. Generated GraphQL code was excluded except at bundle boundaries.

## Baseline

A production build with replayed WordPress fixtures compiled and typechecked successfully. Next's bundle diagnostics report:

| Route | First-load JS, uncompressed |
| --- | ---: |
| ordinary site route | 760,335 B |
| `/produkt/[slug]` | 790,379 B |
| `/[[...slug]]` | 802,975 B |

The optional catch-all adds 42,640 B over an ordinary route. Its two route-specific chunks total 12,264 B gzip. The six chunks attached to the shared site layout total 94,924 B gzip; this is a baseline, not an estimate of removable code.

## Findings

### P1 — Split the homepage from the content catch-all

Rules: `bundle-conditional`, `bundle-dynamic-imports`.

[`src/app/(site)/[[...slug]]/page.tsx`](../src/app/(site)/%5B%5B...slug%5D%5D/page.tsx) imports both the homepage at line 14 and WordPress templates at lines 8 and 12, then selects one branch at lines 95–113. Next therefore gives every homepage visit the gallery/lightbox clients and every WordPress page the homepage's calendar popover, gold animation, and news-image client. The build attributes the full 42,640 B route delta to these combined client references.

Move the homepage to `src/app/(site)/page.tsx`; change the content route to required catch-all `[...slug]`; remove the synthetic empty static param. Then lazy-load the lightbox after gallery activation. This restores route-level code splitting and keeps unopened dialog code out of initial JS.

### P1 — Do not ship the complete cart sheet to every visitor

Rules: `bundle-conditional`, `bundle-dynamic-imports`.

[`src/app/(site)/layout.tsx`](../src/app/(site)/layout.tsx) mounts `CartTrigger` on every site route. [`src/components/Cart/CartSheet.tsx`](../src/components/Cart/CartSheet.tsx) eagerly imports the dialog, cart editor, totals, image, links, and server-action client references, although lines 74–81 return nothing for the cart page and the common empty-cart case. The production client manifest consequently includes `CartSheet` and `CartLines` in every site route.

Keep a small cart bootstrap/trigger in the layout. Dynamically import the full sheet only after the cart is known non-empty or an add action requests it. Preserve the current document order, focus return, and no-JavaScript links.

### P1 — Avoid the checkout request for empty carts

Rule: `async-defer-await`.

[`src/app/(site)/sklep/koszyk/page.tsx`](../src/app/(site)/sklep/koszyk/page.tsx) starts `fetchCheckoutUrl()` unconditionally in the line-23 `Promise.all`. A visitor with no session receives an empty cart locally from `fetchCart()`, yet the second operation still calls the rate-limited WordPress GraphQL endpoint. Existing-session empty carts also pay for it. [`src/app/api/cart/route.ts`](../src/app/api/cart/route.ts) already uses the correct conditional shape.

Fetch the cart first; return the error/empty states before requesting checkout. If non-empty-cart latency matters, extend the cart query to return both cart and checkout URL in one WordPress round trip.

### P2 — Bypass large package barrels

Rule: `bundle-barrel-imports`.

Six client modules import icons from `@hugeicons/core-free-icons`' root. Its installed ESM entry is 6.0 MB and Next 16.2.9 does not include this package in its default `optimizePackageImports` list. Production output is tree-shaken—the audit did not find a 6 MB browser payload—but dev startup, HMR, and builds must still analyze the barrel. [`src/components/ui/warcraftcn/button.tsx`](../src/components/ui/warcraftcn/button.tsx) similarly imports `Slot` through the `radix-ui` aggregate entry.

Use the packages' exported per-module paths, such as `@hugeicons/core-free-icons/Cancel01Icon` and `radix-ui/slot`, or explicitly configure `optimizePackageImports` for Hugeicons. Verify the transformed build before retaining configuration over direct imports.

### P2 — Narrow cart-store subscriptions

Rules: `rerender-derived-state`, `rerender-defer-reads`.

[`src/components/Cart/store.ts`](../src/components/Cart/store.ts) returns the entire snapshot from `useCart()`. Every `loading`, `open`, checkout, or cart update changes its identity. [`src/components/Cart/AddToCartForm.tsx`](../src/components/Cart/AddToCartForm.tsx) needs only cart lines at lines 91–97, but re-renders and recomputes variation axes/availability when the sheet opens, closes, or loads.

Expose stable selector hooks, at minimum one for cart lines and one for the sheet snapshot. Keep selector snapshots referentially stable. Optimize `buildAxes` only after narrowing the subscription; that removes the avoidable renders instead of memoizing around them.

### P3 — Version, validate, and cache consent storage

Rules: `client-localstorage-schema`, `js-cache-storage`.

[`src/components/Consent/Consent.tsx`](../src/components/Consent/Consent.tsx) uses unversioned key `bf-consent`, casts any stored string to `Choice`, and synchronously rereads it on every client navigation. An unknown legacy/corrupt value counts as a decision and suppresses the prompt.

Use a versioned key such as `bf-consent:v1`, accept only `granted` or `denied`, and cache the loaded choice in the existing module store. Route changes still need to recount/reveal parked embeds, but do not need another storage read.

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
- `MOCK_WP=replay NEXT_DIST_DIR=.next-audit bunx next build`

The normal `bun run build` could not complete in the sandbox because its pre-build LQIP refresh contacts live WordPress; the Next production build itself completed against fixtures. No production deployment or production mutation was performed.
