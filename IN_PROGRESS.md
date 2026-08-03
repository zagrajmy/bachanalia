# Bachanalia Fantastyczne — the website

Rebuilding <https://bachanaliafantastyczne.pl/> as a Next.js site on Vercel,
with the existing WordPress kept as a headless CMS and
[ludamus](https://github.com/zagrajmy/ludamus) plugged in for the programme.

Run by ZKF Ad Astra in Zielona Góra. The 2026 edition is the 40th ("XL"),
**25–27 September 2026**, and holds Polcon rank — a hard deadline and more
traffic than usual. Polish-only, so no headless i18n.

```
bachanaliafantastyczne.pl        → Vercel (Next.js App Router)
wp.bachanaliafantastyczne.pl     → existing WordPress: checkout, payment,
                                   shipping, tickets, wp-admin
bachanalia.zagrajmy.net (?)      → ludamus sphere (programme + enrollment)
```

- **Next.js renders everything public.** Static with tag-based ISR; nothing
  rebuilds on publish, WordPress pings a revalidate route instead.
- **WordPress moves to a subdomain**, frontend redirected. Editors keep the
  wp-admin they know.
- **Ludamus owns programme data.** We render a read-only grid server-side and
  deep-link into the sphere for enrollment — auth is Auth0 with per-sphere
  session cookies, so user-context actions have to happen there anyway.

`research/` holds scraped snapshots. `current-content.md` has drifted — its
partner list no longer matches the live page. Re-scrape before trusting it.

## State

- Repo <https://github.com/zagrajmy/bachanalia> (public), `main`.
- Deployed <https://bachanalia.vercel.app> — Vercel project
  `hasparus-projects/bachanalia`, CLI deploys. GitHub auto-deploy is blocked
  until the Vercel GitHub app gets access to the `zagrajmy` org.
- Next.js 16 App Router, bun, Tailwind v4 (CSS-first, no config file).
  oxlint and oxfmt are pinned (1.71.0 / 0.56.0) by bun's
  `minimum-release-age`.
- WPGraphQL 2.18.0 and WooGraphQL 1.0.3 are live: 34 pages, 25 posts,
  22 products.
- `bun run dev` / `build` need `.env.local` — `vercel env pull .env.local`.
- 49 unit tests, 134 e2e specs (desktop + Pixel 7).

`src/gql/schema.gql` is tracked, the generated `.ts` is not, so **codegen
must run before `tsc`** on a clean checkout. Introspection is disabled on the
live site; to refresh, temporarily enable Public Introspection in WPGraphQL,
run `bun run codegen:refresh`, turn it back off.

## Site map

| Path                                                                                                                                | Source                       | Status                                |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------- |
| `/`                                                                                                                                 | hand-built + WooCommerce     | ours                                  |
| `/aktualnosci/`                                                                                                                     | Facebook — see [News](#news) | ours                                  |
| `/goscie/`                                                                                                                          | WP posts                     | ours                                  |
| `/sklep/`, `/produkt/<slug>/`                                                                                                       | WooGraphQL                   | ours                                  |
| `/co-to-sa-bachanalia`, `/organizator`, `/sztab-bachanaliowy`, `/czas-i-miejsce`, `/regulamin`, `/polityka-prywatnosci`, `/noclegi` | WP pages                     | ours                                  |
| `/blok-prelekcyjny`, `/blok-konkursowy`, `/blok-naukowy`, `/blok-komiksowy`, `/rpg`, `/gamesroom`, `/retro-gaming`, `/cosplay`      | WP pages                     | ours                                  |
| `/poznaj-wystawcow`, `/regulamin-wystawcow`, `/zgloszenia-*`, `/wspieraja-nas`                                                      | WP pages                     | ours                                  |
| `/2025/…/<slug>`                                                                                                                    | WP posts                     | ours — 25 dated guest announcements   |
| `/program`                                                                                                                          | ludamus feed                 | not built                             |
| `/koszyk`, `/zamowienie`, `/moje-konto`, `/zwroty`                                                                                  | WooCommerce                  | still WordPress                       |
| `/zamowienie/order-received/<id>/`                                                                                                  | WooCommerce                  | ours at cutover — delivers the ticket |

`/akredytacja` 301s to `/sklep/`. `/info`, `/blog` and `/feed-test` are gone.

`sitemap.ts` builds from the same sources the routes do — `AllContentQuery`
plus the product slugs, with the four WooCommerce paths, the redirect sources
and two abandoned WordPress drafts excluded by name. `robots.ts` no longer
proxies WordPress's `robots.txt`; that only ever surfaced its first `Allow`
line and pointed crawlers at `wp-sitemap.xml`.

**Products live at `/produkt/<slug>/`**, the URL WooCommerce already
publishes, so every indexed link works with no redirect.

### URL strategy

Pretty permalinks 404 on WordPress — the server rewrite is broken — so every
indexed URL is the `/index.php/…` form, and that is where the link equity is.

- Canonical is the clean path. `/index.php/<anything>` → 301 → `/<anything>/`.
- `trailingSlash: true`, so redirect destinations must keep the slash or every
  indexed URL costs a second hop. `next.config.test.ts` enforces that, plus:
  same-site redirects permanent, outbound ones not — a browser caches a 301
  indefinitely and WordPress is about to move.
- **Do not fix WP permalinks before cutover.** Switching to "Post name" while
  WordPress is still the public frontend rewrites every live URL and could
  take the shop down mid-sales. Until then `src/utils/nextSlugToWpSlug.ts`
  maps clean paths to the URIs WPGraphQL resolves; delete it at cutover.

## Design

White paper, navy ink. Two darks carry the inverted bands — navy `#191f5c`
for the hero and footer, petrol `#1f3c50` (the rooster's tail) for the
opening hours. Coral `#ee7489` is the accent and takes navy text; white on
coral is 2.8:1 and fails. Coral also fails as body text on white at 2.5:1, so
text-weight accents use rose `#c0455f`. Muted ink is slate `#4e5079` at
7.4:1; on the darks it is lilac `#cbbbcf`. The `ink-inverted` utility flips
the whole set for a subtree, so a dark band's children keep using `text-ink`
and `text-ink-muted`.

Utilities in `globals.css`: `display`, `eyebrow`, `gutter`, `ink-inverted`,
`punched`, `screened`, `gold`. Containers are `mx-auto max-w-6xl`.

Type: **Bricolage Grotesque** carries both `--font-display` and
`--font-body`; **Cinzel** is the button face, behind a `--font-button`
indirection so it can be swapped without touching components. Both come from
`next/font/google`; nothing is self-hosted. Both cover `latin-ext` — Polish
diacritics are non-negotiable.

### The key art

`src/content/key-art.png` is the XL banner with its text, both logos and the
coral frame removed. **The rooster is the illustrator's own pixels**; only the
emptied sky is generated, and it contains no drawn subject. `tools/key-art/`
holds the source, the generated file, the prompt, and `verify.py`, which
exits non-zero if the bird ever moves. Run it before changing the artwork —
an image model asked to erase text will happily redraw the whole canvas, and
it looks right until you diff it.

The con's identity — key art, the Ad Astra and Polcon marks, every partner
logo — are static imports under `src/content/`, so they do not round-trip
through WordPress at runtime. Only editorial images stay remote. Both marks
carry the key art's lilac and only work on a dark ground.

The favicon is Ad Astra's BF monogram, potraced, served as an SVG that
answers `prefers-color-scheme`; iOS ignores SVG favicons so `apple-icon.png`
is the plated fallback. `opengraph-image.png` comes from
`tools/key-art/social.py` and is worth caring about — almost every visitor
arrives from a Facebook link.

## WordPress as CMS

Editors author in Elementor. Its wrappers are neutralised with
`display: contents` and the semantic children inherit the design system.
Widget vocabulary is small: `text-editor`, `image`, `heading`,
`image-carousel`, one Google map, one button.

**One request per content page.** A single `ContentQuery` returns everything
`generateMetadata` and the page body need, shared through React `cache()`. A
full prerender costs ~76 WordPress requests.

### That server is slow, and concurrency makes it slower

A single query answers in ~1.3s; eight in parallel take ~10s each. A
prerender walks ~57 routes.

**Do not add a per-attempt fetch timeout.** It aborts requests that were about
to succeed, and each retry adds load to the pile the server is already
struggling with. `fetchGraphQL` retries 403/429/5xx with backoff and no
deadline; `staticPageGenerationTimeout: 240` catches a genuinely hung socket,
which costs one of Next's three page attempts rather than killing the build.

Playwright's default worker count stampedes a cold dev server the same way
and produces phantom failures. Run e2e at `--workers=2`.

**No spec talks to the live WordPress**, read or write. Not because a read is
dangerous but because it is slow and rate-limited: a full run against it took
2.7 hours and failed on requests that passed warm. GraphQL is mocked at the
Next server with `msw`, keyed by operation name, from fixtures recorded on
purpose by a script — never as part of `bun run test`. A spec that cannot pass
with the WordPress host unreachable is a bug in the spec.

Queries go over GET — cacheable, which is what ISR wants. POST also works, so
mutations are reachable when the cart needs them.

### Revalidation

`src/app/api/revalidate/route.ts` takes `PUT` with `{ tags, paths }` and
authenticates on `X-Headless-Secret-Key` against `HEADLESS_SECRET`, which is
set in all three Vercel environments.

`wordpress/bachanalia-revalidate/` is the WordPress half — written,
syntax-checked, **never installed**. Install via **Wtyczki → Dodaj wtyczkę →
Wyślij wtyczkę na serwer**, activate, then fill in **Ustawienia →
Rewalidacja strony**. The target is a setting rather than a constant because
it must point at Vercel until the domain is rewired and at the con's domain
afterwards; it refuses to fire while the target host equals WordPress's own,
and there is a test button.

Until it is installed, edits take up to an hour to appear.

## Shop

WooCommerce is load-bearing — it sells 2026 accreditation through Paynow.

Browse is ours: `/sklep/` and `/produkt/<slug>/` render from WooGraphQL
through the same `/graphql` endpoint as everything else. Prices come from
WooCommerce, never hardcoded — only the label, note and order of the
accreditation tiers are editorial, in `src/content/con.ts`.

Two things that will bite:

- **Fragment on `ProductWithPricing`, not `SimpleProduct`.** The day passes
  are SIMPLE but the three-day pass and Golden Ticket are VARIABLE, and a
  `SimpleProduct` fragment returns null for half the table.
- **Do not use `product(id:, idType: SLUG)`.** WooGraphQL answers an unknown
  slug with a GraphQL `errors` array, and `fetchGraphQL` throws on any
  `errors`, so that form 500s where a 404 is owed. The connection with
  `slugIn` returns an empty list instead.

The cart is ours; **checkout is WordPress's**, on `wp.`, reached through
WooGraphQL's nonced `/transfer-session` URL so the same cart carries over. See
[To-do for Prod](#to-do-for-prod) for why, and what is left to wire.

### Going fully headless

The goal is WordPress as pure backend. What is known:

- The cart surface is all there: `addToCart`, `updateItemQuantities`,
  `removeItemsFromCart`, `emptyCart`, `applyCoupon`, `checkout`.
- `CheckoutPayload` returns `order`, `redirect` and `result`. WooGraphQL's
  checkout runs the classic `process_payment()` path, which is where
  `pay-by-paynow-pl` lives — so a redirect is plausible, unlike through the
  Store API.
- Live gateways are `pay_by_paynow_pl_paywall` and `bacs`. **Bank transfer needs
  no redirect at all**, so that path is headless today with zero payment work
  — though bank transfer for a 50 zł ticket is friction most people abandon.

**A `bacs` order has been run end to end** (order 3502, 1 zł, 1 August 2026),
and it settles most of this:

- WooGraphQL 1.0.3's `checkout` works against WooCommerce 10.9.4 despite
  declaring "tested up to 10.4.3". `result` came back `success`, the order was
  created `ON_HOLD` with `paymentMethodTitle` "Przelew bankowy".
- **`redirect` is populated** — `/zamowienie/order-received/3502/?key=…`. That
  is the classic `process_payment()` return value coming through the mutation
  intact, which is the same channel Paynow would hand back its gateway URL on.
- The session is a JWT: mutations answer with a `woocommerce-session` response
  header, and sending it back as `woocommerce-session: Session <token>` on the
  next request carries the cart into checkout. Mutations go over POST and
  Wordfence does not block them.

**A Paynow order was run end to end from here** (3510, 1 zł, 2 August 2026):
`checkout` returned `https://paywall.paynow.pl/<id>?token=<jwt>` and the order
was paid and completed. So a headless checkout _works_ — it is simply not what
we ship, because it can collect neither a BLIK code nor an InPost locker. The
proof is kept on `wip/headless-checkout`.

Getting there took a WooCommerce setting, and the reason is worth keeping:

- **Only the paywall gateway can be driven from here.** The per-method
  gateways collect a field on WooCommerce's own checkout page and read it with
  `filter_input(INPUT_POST, …)` — `authorizationCode` for BLIK level 0,
  `paymentMethodId` for the bank picked out of the PBL list. WPGraphQL refuses
  any body that is not `application/json`, so `$_POST` is empty on every
  GraphQL request and neither can ever be filled. A form-encoded body is
  rejected outright; `metaData` does not reach the gateway. Both were tried.
- The paywall gateway posts nothing, so it works. It appears **only** when the
  plugin's **Pokaż metody płatności** (`show_payment_methods`) is unchecked —
  `is_available()` is `! $this->show_payment_methods && $is_paynow_enabled`.
  That `$is_paynow_enabled` means at least one Paynow gateway must stay
  enabled in WooCommerce; switching the now-invisible per-method gateways off
  would take the paywall down with them and leave buyers only `bacs`.
- The trade this bought: buyers used to type a BLIK code on the page and never
  leave. Now everyone takes one hop to Paynow. Re-checking the box reverses it.

**A Paynow payment is single-use.** Two links died before a buyer reached
them: one created after failed BLIK and PBL attempts against the same cart —
the plugin derives Paynow's external id and idempotency key from the cart —
and one merely opened in a browser to check that it rendered. The signed token
carries a two-week expiry, so this is payment state, not expiry. Hand the
`redirect` straight to the buyer, create a fresh order per attempt, and never
re-offer an old URL.

**Order 3510 was paid for real** and WooCommerce moved it to `wc-completed`
on its own, so Paynow's notification handler works and nothing of ours needs
to run in that loop.

### The page after payment

Paynow returns the buyer to
`/zamowienie/order-received/<id>/?key=wc_order_…`, which after cutover is a
URL **we** have to serve. What WooCommerce renders there:

- `ul.woocommerce-order-overview` — number, date, total, payment method.
- `section.woocommerce-order-details` — the line items and totals.
- **A ticket.** Event Tickets with Ticket Scanner issues one per order and
  links it three ways, all under
  `/wp-content/plugins/event-tickets-with-ticket-scanner/ticket/…`: the order's
  tickets (`ordertickets-<id>-<hash>`), the ticket itself
  (`<serial>-<id>-<hash>`) and the same with `?pdf`. The line item also
  carries a validity window. This is what an attendee shows at the door, so
  the page is not a courtesy — it delivers the product.

**A guest order cannot be read back at all.** `OrderIdTypeEnum` has
`ORDER_KEY`, but the query answers "Not authorized to access this order" both
anonymously _and_ with the very session that placed the order — tested with a
throwaway `bacs` order (3511). Guest orders need a logged-in owner.

So the confirmation page is not ours to build: it prints an order we cannot
read and a ticket we cannot mint. `/zamowienie/order-received/:path*` redirects
to WordPress instead, temporarily, key and all — WooCommerce authorises that
page on the key alone, so the ticket, its PDF and the emails keep working
untouched. `next.config.test.ts` pins both the rule and its 307.

Still unverified: at cutover the session cookie's domain changes when
WordPress moves to a subdomain, and a cart built on the apex would silently
empty.

Cart routes have to be dynamic, since the session token cannot be cached.

### Shipping, and InPost

The shop is not only accreditation, and **InPost is live**. A cart holding a
book offers four rates — `free_shipping:1` (personal pickup,
still labelled "podczas BF 24"), `free_shipping:2` ("Wysyłka online", for
accreditations and ebooks), `easypack_parcel_machines:4` (Paczkomat, 15 zł)
and `easypack_shipping_courier:5` (Kurier, 18 zł).

`updateShippingMethod(["easypack_parcel_machines:4"])` selects a rate and
WooCommerce recalculates, so that half is headless already. What is not
settled is **which** locker: on WooCommerce's checkout that comes from
InPost's geowidget. The plugin exposes `POST /wp-json/inpost_pl/v1/order/update`,
which 403s unauthenticated and is the likely way to attach a point to an order
after creating it.

Accreditation sidesteps all of it — it is virtual, so `needsShippingAddress`
is false and no rate applies. A headless flow for tickets needs no address, no
rate and no locker; books, shirts and the Golden Ticket do.

**Add-to-cart** via `?add-to-cart=<id>` is a plain GET WooCommerce supports,
but only for SIMPLE products. Every accreditation except Sunday is VARIABLE
with size variants, which need `variation_id` plus attribute params — i.e.
rebuilding WooCommerce's variation picker and staying in sync with its
attribute slugs. Getting it wrong sells the wrong shirt size.

## News

**There is no news in WordPress.** All 25 posts are guest profiles filed under
an edition category (`gosc25` × 25, nothing in `gosc26`). Querying posts with
those excluded returns an empty array.

`fetchNews` filters guest categories out so last year's guest list can never
appear as this year's news. The specs assert that rather than a post count.

Real news lives only on Facebook, surfaced on the old site by Custom Facebook
Feed Pro. It exposes nothing machine-readable — no REST route under
`cff`/`sb-`/`smash`, and WPGraphQL sees only `post`, `page`, `attachment`,
`product`. The rendered markup is the only public copy and does carry
everything usable (`data-cff-timestamp`, `data-object-id`, `.cff-post-text`,
permalinks, images). Page ID is `347748351932621`.

**So the feed is the news.** WordPress's own front page carries the CFF Pro
shortcode, and WPGraphQL hands its rendered markup over like any other
content — `nodeByUri(uri: "/")` — so the feed arrives through the same cached,
retrying request as the rest of the site, with no token, no Meta app and no
HTML fetch for Cloudflare to challenge. `facebookNews.ts` parses it:
`data-cff-timestamp` for the date, `cff_<page>_<post>` for the permalink,
`.cff-text` for the body, and the 720px entry of `data-img-src-set` for the
picture. `fetchNews` prefers WordPress and falls back to this, so the day
someone does publish an announcement it takes over.

Two things about the pictures. They are signed fbcdn URLs that expire, so each
one is checked with a HEAD before it renders and the card drops to text if it
has gone — a row of broken frames is worse than none. And the feed reports no
dimensions, so they are plain `<img>` at their natural shape rather than
`next/image`; there is nothing to reserve.

**Do not use the `ad-astra-social-bridge` plugin on `/feed-test/`.** It renders
the same posts with no dates, truncated text and an fbcdn cache stale enough
that most images 403. CFF refreshes; that one does not. Both `/feed-test/` and
`/info/` are in `RETIRED_PATHS` and 404 here.

What breaks it: a CFF Pro update that renames those classes. The durable
alternative is still Ad Astra's own Meta app and a long-lived Page token,
which needs Page admin for twenty minutes. Graph API reads of a page's own
posts are free.

## Traps

- **`display: contents` breaks sibling combinators.** It flattens layout, not
  DOM structure. Every Elementor paragraph sits alone in its own wrapper, so
  `.wp-content > * + *` matches nothing. Rhythm uses per-element
  `margin-block-end`; do not reintroduce `+` or `~` in `.wp-content`.
- **Turbopack caches CSS across dev runs.** A whole block can appear absent
  from the compiled stylesheet while standalone Tailwind compiles it fine.
  Stop dev, move `.next` aside, restart.
- **Tailwind v4 source auto-detection walks the whole project** and chokes on
  directories it cannot read. `globals.css` uses `source(none)` plus an
  explicit `@source`.
- **`generateStaticParams` must return `{ slug: [...] }` objects**, not bare
  arrays. Bare arrays are silently ignored: the build succeeds, reports SSG,
  and prerenders nothing.
- **Two WordPress pages have a null `uri`** — `goscie` and `sklep`. URI
  lookups 404 them even though they serve fine on WordPress. They need
  explicit routes.
- **Guest photos live only in `featuredImage`**, never inside `content`.
- **`String.replace` passes the match offset** as the second callback argument
  when the pattern has no capture group, so a `= ""` default never applies.
- **Full-page screenshots do not wait for many remote images.** Verify layout
  numerically, not from the capture.
- **Asset filenames lie.** `2026/07/kepler.png` is the **Planetarium Wenus**
  mark. Open the image before naming an organisation.
- **oxfmt reads `.gitignore`**, where `schema.gql` is deliberately un-ignored,
  so it reformats 35k lines of generated output. `.prettierignore` keeps it
  out.
- **`bun run lint` (bare `oxlint`) hangs.** Scope it to directories.
- **`shadcn init` rewrites the design system** — an oklch grey palette, a dark
  variant, `@theme inline`, and Geist plus `font-sans` on `<html>` overriding
  the body font. Take component files, not the init.
- **Cloudflare fronts the site** and challenges document requests from
  automated clients, returning 403 on HTML while `/graphql` and
  `/wp-content` keep answering. It expires on its own. Wordfence rate
  limiting is not the cause — every threshold there is _Bez ograniczenia_.

## Open work

1. **Clear the test orders.** Probing checkout wrote real 1 zł orders to the
   live shop: 3502 (`bacs`, `ON_HOLD`), 3507 and 3509 (Paynow payments
   consumed before a buyer reached them) and 3511 (read-back probe). 3510 was
   paid and is `wc-completed` — leave it, it is the proof the loop works.
2. **Cut over.** Everything for it is in [To-do for Prod](#to-do-for-prod).
3. **`/program` + ludamus feed.** Needs the upstream JSON endpoint, the
   Bachanalia sphere at `bachanalia.zagrajmy.net`, and the organizer
   onboarding video Ad Astra is owed.
4. **`wsparcie-klubu-1-zl` and `akredytacja-wspierajaca-polcon`** (25–45 zł)
   exist in the shop but are not in the homepage tier list — nobody has said
   where they belong.
5. **The free pickup rate still says "BF 24"** on a 2026 shop: _Odbiór
   Osobisty podczas BF 24 (dotyczy Fantazji Zielonogórskich, Golden Ticket,
   oraz Koszulki)_. WooCommerce setting, not code, and a buyer sees it at
   checkout.
6. Vercel GitHub app access to the `zagrajmy` org.
7. **Re-test the checkout constraint** before rebuilding anything on it —
   [#1](https://github.com/zagrajmy/bachanalia/issues/1),
   [#2](https://github.com/zagrajmy/bachanalia/issues/2),
   [#3](https://github.com/zagrajmy/bachanalia/issues/3). The Store API takes
   a JSON body and exposes `payment_data`, so "a JSON request can never fill
   `$_POST`" may not be the whole story. Not before the con.

## To-do for Prod

**The order is WordPress's.** Browsing and the cart are ours; from "do kasy"
onward the buyer is on `wp.` and WooCommerce owns checkout, payment,
shipping, the ticket and the emails. That is not a retreat — it is the only
place BLIK level 0 and an InPost locker can be collected at all, because both
are read from `$_POST` on WooCommerce's own checkout page and a JSON GraphQL
request can never fill it. What we keep is everything a buyer sees before they
pay, which is also everything that made the old shop look like 2014.

### 1. WordPress, before anything else

1. **Serve WordPress from `wp.bachanaliafantastyczne.pl`** and confirm
   WooCommerce still checks out there — cookies, Paynow's return URL and the
   ticket links all carry the host.
2. **Enable the session handoff, then save the page a second time.** WPGraphQL
   for WooCommerce → _User Session transferring URLs_, plus the _Checkout URL_
   checkbox under it. The endpoint already answers at `/transfer-session`; the
   setting is what exposes the nonced URL our cart needs.

   The second save is not superstition. The four `*_nonce_param` inputs render
   disabled until a URL field is enabled, and a disabled input is not
   submitted — so the save that enables the checkboxes cannot write them.
   Without those options `Protected_Router::get_nonce_names()` returns only
   `download_url`, the plugin never looks for the `_wc_checkout` our URL
   carries, and it gives up before the nonce is even checked. Every failure in
   that handler exits through the same `status_header( 404 )` plus a redirect
   home, so a broken handoff and a missing endpoint are indistinguishable from
   outside. Ours looked like a missing endpoint for a day.

3. **Install `wordpress/bachanalia-checkout-handover/`.** Without it the
   transfer succeeds and then dumps the buyer on `/checkout/`, which 404s
   here — WooGraphQL builds that address from `get_permalink()`, and the
   transfer runs where there is no post to take one from.
4. **Leave _Pokaż metody płatności_ unchecked.** It was unchecked on 2 August
   and it stays that way: the buyer takes one hop to Paynow's paywall and
   picks BLIK, a bank or a card there. The alternative — BLIK level 0 — has
   the buyer type a six-digit payment code into WordPress, which then posts it
   onward. On a site that was compromised for two and a half years through an
   unmaintained plugin, that is a credential we should never be holding. It
   costs the inline flow's conversion; it removes payment data from the attack
   surface entirely. Leave every Paynow gateway enabled — the paywall's
   `is_available()` needs at least one of them on, even though they no longer
   render separately.
5. **Install `wordpress/bachanalia-paynow-first/`** so Paynow is the first and
   preselected method. Dragging the row does not do it: the paywall gateway
   only becomes available once _Pokaż metody płatności_ is unchecked, so it has
   no saved position and `WC_Payment_Gateways::init()` parks it at 999 behind
   bank transfer — which is the slowest way to pay for a ticket and leaves the
   order unpaid until somebody reconciles a transfer by hand. The plugin
   filters `woocommerce_gateway_order`, the one input both the classic and the
   Blocks checkout read. **Do not hand-edit positions**: `init()` indexes
   gateways _by_ position, so a repeated number deletes a gateway from the
   store outright.
6. **Install `wordpress/bachanalia-revalidate/`** and point it at the Vercel
   deployment, then at the apex once DNS moves. Until it is installed, an edit
   takes up to an hour to appear.
7. **Clear the test orders** — 3502, 3507, 3509, 3511. Keep 3510: it is the
   paid one that proves the payment loop.
8. **Fix the pickup label.** The free rate still reads "Odbiór Osobisty podczas
   BF 24" on a 2026 shop.
9. **Do not touch permalinks** until the frontend has moved.

### 2. Our side

Only one thing here is still outstanding.

1. **Repoint the order-received redirect** at `wp.` once the host exists.
   `next.config.js` sends `/zamowienie/order-received/:path*` to
   `NEXT_PUBLIC_WORDPRESS_API_URL` today, which is the apex.
2. Work through the rest of the quality review — the shipping-cost mismatch,
   the retry that can double a line, the unguarded `response.json()`.

Done: the checkout half is deleted and "Przejdź do płatności" hands over to
WooCommerce end to end (`192c0cc`, plus the two WordPress fixes in step 2 and
3 above); `/sklep/`'s "Koszyk →" points at our own cart; the four WooCommerce
paths are in `RETIRED_PATHS` and 404 here; `robots.ts` disallows
`/sklep/koszyk/`; the specs `ab46004` broke are fixed.

### 3. DNS and Vercel

1. Apex and `www` → Vercel; `wp.` → dhosting.
2. `HEADLESS_SECRET`, `NEXT_PUBLIC_BASE_URL` and the WordPress host set in all
   three Vercel environments.
3. Vercel's GitHub app still needs access to the `zagrajmy` org before pushes
   deploy themselves.

### 4. Verify, in this order

1. `bun run build` once against the real WordPress — it is slow and hammers a
   rate-limiting server, so leave time.
2. Old URLs 301 to the clean paths, and `/index.php/…` with them.
3. Buy something end to end: product → cart → handoff → BLIK → ticket in the
   inbox. Cancel the order afterwards.
4. `sitemap.xml` lists the new routes and none of the WooCommerce four;
   `robots.txt` points at our sitemap.
5. Full e2e at `--workers=2` against the deployment.

### 5. If it goes wrong

DNS back to WordPress. Nothing in WooCommerce changes during cutover except
the two settings above, so the old shop is always one A record away — which
is the reason to make no schema, permalink or product change on the same day.

## Open questions

- Who controls DNS and the WP hosting? Can we add the `wp.` subdomain?
- Historical content — migrate, archive or drop? **Assumed: migrate the 25
  dated 2025 guest posts as-is at their existing paths.** Confirm before
  cutover.
- Staff signups — ludamus questionnaire, WP form, or a server action?

## Security

The site was compromised for ~2.5 years through an unmaintained plugin
(CVE-2023-5360 in Royal Elementor Addons) and cleaned in July 2026. That
history sets the standing rules:

1. **WooGraphQL is not on wordpress.org.** It installs from a GitHub zip and
   gets no auto-updates — precisely the failure mode that caused the
   compromise. It needs a manual update habit, as do EmbedPress, the Ashe
   theme, Smart Slider 3, Event Tickets and Google for WooCommerce.
2. Rotate admin passwords and wp-config salts; rotate hosting/DB credentials.
   Hosting is **dhosting.pl**, account `yodi`.
3. Google Search Console: security check and reindex request.
4. Keep spot-checking for spam markers. Spam returning means persistence
   outside the webroot and needs dhosting panel access.
5. A Wordfence in-panel re-scan is still owed; verification so far has been
   external only.
6. Application passwords are disabled by Wordfence deliberately. Do not
   re-enable them to solve a tooling problem.

Wordfence free, license on the `kobold.zagrajmy` shared mailbox.

## Tooling

- `playwriter` drives wp-admin, where the user stays signed in. Its
  `page.click()` on WordPress settings forms crashes the relay mid-navigation;
  use `form.requestSubmit()` inside `page.evaluate()` and verify out-of-band.
- `agent-browser` for rendered output and asset scraping; viewport is
  `agent-browser set viewport <w> <h>`.
- `potrace` and `magick` are installed.
