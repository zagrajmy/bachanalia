# Open work

Architecture, the site map, the design system and the traps this codebase has
already fallen into live in [`docs/architecture.md`](./docs/architecture.md).
This file is only what is left to do.

## Blocking ticket sales

1. **Event Tickets premium is dead.** What is installed on `wp.` under that
   name is Vollstart's kill-switch stub, so the shop runs on free-tier limits:
   50 tickets in total, no auth tokens for door scanners, no PDF on the ticket
   email. Either the licence names the apex while WordPress now reports `wp.`,
   or the subscription lapsed — from inside WordPress the two look identical,
   since the plugin prints "subscription expired" for any rejected check. Ask
   Vollstart which it is. A Polcon cannot open sales capped at 50 tickets.
2. **Clear the test orders.** Probing checkout wrote real 1 zł orders to the
   live shop: 3502 (`bacs`, `ON_HOLD`), 3507 and 3509 (Paynow payments
   consumed before a buyer reached them) and 3511 (read-back probe). 3510 was
   paid and is `wc-completed` — leave it, it is the proof the loop works.
3. **The free pickup rate still says "BF 24"** on a 2026 shop: _Odbiór
   Osobisty podczas BF 24 (dotyczy Fantazji Zielonogórskich, Golden Ticket,
   oraz Koszulki)_. WooCommerce setting, not code, and a buyer sees it at
   checkout.
4. **`wsparcie-klubu-1-zl` and `akredytacja-wspierajaca-polcon`** (25–45 zł)
   exist in the shop but are not in the homepage tier list — nobody has said
   where they belong.

## Finishing the cutover

`wp.` serves WordPress and the apex answers from Vercel, so the DNS half and
the `siteurl` half are done. What still points the old way:

1. **Repoint the order-received redirect** at `wp.`. `next.config.js` sends
   `/zamowienie/order-received/:path*` at `NEXT_PUBLIC_WORDPRESS_API_URL`,
   which is still the apex — and the apex is us now, so that rule and the
   `/wp-content/` ones below it currently target themselves.
2. **Repoint `bachanalia-revalidate`** at the apex. It is installed and active
   but still aimed at the Vercel deployment URL.
3. **Check `HEADLESS_SECRET`, `NEXT_PUBLIC_BASE_URL` and the WordPress host**
   in all three Vercel environments.
4. Vercel's GitHub app still needs access to the `zagrajmy` org before pushes
   deploy themselves.
5. Work through the rest of the quality review — the shipping-cost mismatch,
   the retry that can double a line, the unguarded `response.json()`.

**Do not touch permalinks**, and change no schema, permalink or product on a
cutover day. Rolling back is one A record; it only stays that cheap while
WooCommerce is untouched.

## Verify, in this order

1. `bun run build` once against the real WordPress — it is slow and hammers a
   rate-limiting server, so leave time.
2. Old URLs 301 to the clean paths, and `/index.php/…` with them.
3. Buy something end to end: product → cart → handoff → BLIK → ticket in the
   inbox. Cancel the order afterwards.
4. `sitemap.xml` lists the new routes and none of the WooCommerce four;
   `robots.txt` points at our sitemap.
5. Full e2e at `--workers=2` against the deployment.

## Later

- **`/program` + ludamus feed.** Needs the upstream JSON endpoint, the
  Bachanalia sphere at `bachanalia.zagrajmy.net`, and the organizer onboarding
  video Ad Astra is owed.
- **Re-test the checkout constraint** before rebuilding anything on it —
  [#1](https://github.com/zagrajmy/bachanalia/issues/1),
  [#2](https://github.com/zagrajmy/bachanalia/issues/2),
  [#3](https://github.com/zagrajmy/bachanalia/issues/3). The Store API takes a
  JSON body and exposes `payment_data`, so "a JSON request can never fill
  `$_POST`" may not be the whole story. Not before the con.

## Open questions

- Historical content — migrate, archive or drop? **Assumed: migrate the 25
  dated 2025 guest posts as-is at their existing paths.** Confirm before
  cutover.
- Staff signups — ludamus questionnaire, WP form, or a server action?
