# Open work

1. **The free pickup rate still says "BF 24"** on a 2026 shop: _Odbiór
   Osobisty podczas BF 24 (dotyczy Fantazji Zielonogórskich, Golden Ticket,
   oraz Koszulki)_. WooCommerce setting, not code, and a buyer sees it at
   checkout.

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

- **`/program` + ludamus feed.** The
  Bachanalia sphere at `bachanalia.zagrajmy.net`, and the organizer onboarding
  video Ad Astra is owed.
- **Re-test the checkout constraint** before rebuilding anything on it —
  [#1](https://github.com/zagrajmy/bachanalia/issues/1),
  [#2](https://github.com/zagrajmy/bachanalia/issues/2),
  [#3](https://github.com/zagrajmy/bachanalia/issues/3). The Store API takes a
  JSON body and exposes `payment_data`, so "a JSON request can never fill
  `$_POST`" may not be the whole story. Not before the con.

## Open questions

- Staff signups — ludamus questionnaire, Google form, or a server action?
