# Open items

Working notes, newest concern first. Longer-lived context lives in
[HANDOFF.md](HANDOFF.md) and [plan.md](plan.md).

## Wordfence blocks this machine, and /akredytacja was stale

Confirmed 2026-07-30: the shop loads fine from a phone on mobile data, while
every HTML request from this workstation answered 403 and GraphQL from the
same machine answered 200 in ~1.2s. That is Wordfence rate-limiting the IP
(`188.121.1.238`) on frontend HTML after a day of production builds, not a
broken shop.

The old `/akredytacja` page pointed at Biletomat, who no longer sell the
tickets — the shop does. `primaryCta` now goes straight to the shop and
`/akredytacja` 302s there. The 302 is deliberate: WordPress moves to a
subdomain at cutover and a browser caches a 301 indefinitely.
`next.config.test.ts` enforces permanent for same-site hops, temporary for
outbound ones.

## WordPress could plausibly become a pure backend

Checked 2026-07-30 against the live site, and it contradicts what HANDOFF and
plan.md assume:

- **POST /graphql is no longer blocked.** Both a plain query and a connection
  query (`products(first:2){nodes{slug}}`) return 200 over POST — the exact
  shape HANDOFF says Wordfence rejects. Mutations must be POST, so this was
  the blocker for a cart and it is gone. Reads should stay on GET anyway,
  because GET is cacheable and that is what ISR wants.
- **The cart surface is all there**: `addToCart`, `updateItemQuantities`,
  `removeItemsFromCart`, `emptyCart`, `applyCoupon`, `checkout`.
- **`CheckoutPayload` returns `order`, `redirect` and `result`.** plan.md
  concluded a redirect is only available for gateways with a blocks
  integration — that is true of the **Store API**, but WooGraphQL's checkout
  runs the classic `process_payment()` path, which is exactly where
  `pay-by-paynow-pl` lives. The objection does not transfer.
- **Live gateways are `pay_by_paynow_pl_blik` and `bacs`.** Bank transfer
  needs no redirect at all, so it is headless today with no payment work.

Still unverified, and each needs a real order to settle:

1. Whether Paynow populates `redirect` through the WooGraphQL mutation.
2. WooGraphQL 1.0.3 declares "WC tested up to 10.4.3" while the site runs
   10.9.4. HANDOFF says do not use its checkout mutations; that caution is
   untested, not disproven.
3. Session handling — the cart is a `woocommerce-session` token that
   `fetchGraphQL` does not carry, and cart routes have to be dynamic.
4. At cutover the session cookie's domain changes when WordPress moves to a
   subdomain. A cart built on the apex would empty.

Cheapest way to settle 1 and 2: one `bacs` order end to end on a real
product, then cancel it.

## Facebook is the only place news exists

Decision still open. Every WordPress post is a guest profile filed under an
edition category (`gosc25` × 25, nothing in `gosc26`); there is not one
announcement among them. `fetchNews` filters those out, so `/aktualnosci/`
correctly shows its empty state today.

Options, from a wp-admin dig:

| Route | Needs Page admin | Breaks when |
| --- | --- | --- |
| Publish news in WordPress | no | never — but it means posting twice, which Ad Astra will not do |
| Own Meta app + long-lived Page token | once, ~20 min | never |
| Reuse the token CFF Pro already holds | no | Smash Balloon rotates it |
| Scrape the CFF markup | no | plugin updates its HTML |

Custom Facebook Feed Pro is licensed and connected to the page. It exposes
nothing machine-readable: no REST route under `cff`/`sb-`/`smash`, and
WPGraphQL sees only `post`, `page`, `attachment`, `product`. The rendered
markup on the homepage is the only public copy, and it does carry everything
(`data-cff-timestamp`, `data-object-id`, `.cff-post-text`, permalinks,
images). Page ID is `347748351932621`.

Graph API reads of a page's own posts are free; the rate limit is thousands
per day and one call an hour would use 24.

## WordPress under a prerender

The build fans out ~190 requests. Concurrency takes that server from ~1.3s to
~10s per query — measured, eight parallel queries all returned 200 in
9.9–10.4s. Do not add a per-attempt fetch timeout: one was added and removed
today, and it was aborting requests that were about to succeed while each
retry piled on more load. Three builds died on three different pages before
that came out. `staticPageGenerationTimeout: 240` catches a genuinely hung
socket instead, and costs one of Next's three page attempts rather than the
whole build.

## Navigation, honestly

The header is shadcn's `navigation-menu` on Radix. What it cost versus the
CSS-only version it replaced:

- ~30 kB of JS and a client component for what was free.
- Focus-to-open is bolted on. Radix deliberately does not open on focus, so
  `SiteHeader` holds controlled state plus `onFocus`/`onBlur`. The e2e test
  "a nested destination is reachable by keyboard" is the only thing guarding
  it; a `shadcn add --overwrite` or a Radix upgrade could quietly break it.
- `src/components/ui/navigation-menu.tsx` keeps shadcn's structure and every
  motion class, but its colour utilities are swapped for ours — the project
  has no shadcn token layer and its `--color-accent` is the coral, not a
  hover background. Re-running the generator overwrites that.
- `components.json` records `style: radix-nova`, which would pull
  `shadcn/tailwind.css` into any future component. That import is not
  present, so a future `shadcn add` needs a look before it is trusted.

## Smaller things

- `src/app/favicon.ico` was the Vercel triangle from the template until
  today. Replaced by `icon.png` plus `opengraph-image.png`, both generated by
  `tools/key-art/social.py` from the cleaned artwork.
- The key art has AI-generated sky where the text and logos were removed. The
  bird is the illustrator's pixels, verified at 0.00% deviation.
  `tools/key-art/verify.py` gates that and exits non-zero if it regresses.
- `/goscie/` and the news archive read the same 25 posts. The guests page is
  honest about showing the 2025 edition; the news archive is not allowed to.
