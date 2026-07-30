# Handoff — Bachanalia website (updated 2026-07-27)

Continuation notes for the next session. Project context lives in
[plan.md](plan.md) (architecture, site map, URL strategy, shop split, design
direction, phases) and [research/](research/) (`current-content.md` is the
live-scraped inventory and supersedes `current-site.md`). Read those first —
this file covers state, the work log, and the traps that cost time.

## State

- Repo: https://github.com/zagrajmy/bachanalia (public), `main`.
- Deployed: https://bachanalia.vercel.app (Vercel project
  `hasparus-projects/bachanalia`, linked via `.vercel/`, CLI deploys — GitHub
  auto-deploy still blocked until the Vercel GitHub app gets access to the
  `zagrajmy` org).
- Stack: Next.js 16 App Router + bun + oxlint (`@hasparus/oxlint-config`) +
  oxfmt + Tailwind v4. oxlint/oxfmt pinned (1.71.0/0.56.0) due to bun
  `minimum-release-age`.
- **Now serving real content.** Vercel env (all three environments) points at
  `https://bachanaliafantastyczne.pl`. WPGraphQL 2.18.0 and WooGraphQL
  ("GraphQL for eCommerce" 1.0.3) are live: 34 pages, 25 posts, 22 products.
- `bun run dev`/`build` need `.env.local` — run `vercel env pull .env.local`.

### Testing and CI

- `bun run test` — unit tests (scoped to `src` + `next.config.test.ts`;
  unscoped `bun test` picks up the Playwright specs and dies).
- `bun run e2e` — Playwright against an existing build. `bun run e2e:build`
  builds first. 92 specs, desktop + Pixel 7.
- GitHub Actions runs both on push and PR, green as of `e322fb6`.
- `src/gql/schema.gql` is tracked; the generated `.ts` is not, so **codegen
  must run before `tsc`** on a clean checkout.

## Work log 2026-07-27

**Security.** Re-verified the malware cleanup 17 days on: all 81 sitemap
URLs fetched as Googlebot, zero spam markers, all 17 webshell paths 404,
zero offscreen nodes in the rendered DOM. Still clean. Details in the
incident section below.

**Data layer unblocked.** WPGraphQL was already live and public. Flipped the
Vercel env off `demo.wpgraphql.com` onto the real site, then hit the real
blocker: **WPGraphQL refuses introspection for public requests, and
application passwords are disabled by Wordfence.** Re-enabling an auth vector
that Wordfence deliberately shut off on a site compromised until three weeks
ago was the wrong trade, so instead:

1. Enabled Public Introspection in WPGraphQL settings.
2. Ran codegen, committed `src/gql/schema.gql`.
3. Pointed `codegen.ts` at the local schema file.
4. Turned introspection back off (verified off).

**Builds are now hermetic** — `bun run codegen` succeeds with WordPress
unreachable (tested against an invalid host). To refresh the schema after WP
content-model changes: temporarily re-enable Public Introspection, run
`bun run codegen:refresh`, turn it back off.

**WooGraphQL installed** via wp-admin (browser-driven). Free, GPL-3.0, but
**not on wordpress.org** — it installs from a GitHub zip and gets no
auto-updates in wp-admin. That is exactly the failure mode that caused this
site's 2.5-year compromise, so it needs a manual update habit. It also
declares "WC tested up to 10.4.3" while the site runs WooCommerce 10.9.4 —
fine for product reads, do not use its checkout mutations. Live shop verified
intact after install (all shop routes 200, no PHP errors).

**Design system** built from the key art palette. See plan.md's Design
section for the palette, the type, and the contrast traps. Polish diacritics
are non-negotiable and were checked before committing either family.

## Wordfence blocks GraphQL POSTs

The single most expensive thing to rediscover. Wordfence's firewall
inspects POST bodies and rejects GraphQL **connection** queries with _"a
potentially unsafe operation has been detected"_ (403 HTML, not JSON).
Single-node lookups (`page(id:…)`) pass, which is why page rendering
worked while `posts(first:…){nodes{…}}` silently failed — it broke the
guests archive and `generateStaticParams` while everything else looked fine.

`fetchGraphQL` therefore sends queries over **GET**, which the firewall
allows, is standard GraphQL-over-HTTP, and is cacheable where POST never
was. Do not "modernise" it back to POST. If a query starts 403ing, check
Wordfence before suspecting the query.

Wordfence **also rate-limits bursts**, independently of query shape. A
prerender walks 68 pages at once, and a single refusal used to fail the
whole build (observed once on `/regulamin-wystawcow-2`, and again when
several agents hit the site concurrently — every route 500'd for minutes,
then recovered on its own). `fetchGraphQL` retries 403/429/5xx with backoff
for that reason. If builds start failing in bursts, this is why.

## Traps that cost time

- **Turbopack caches CSS across dev runs.** The entire `.wp-content` block
  appeared absent from the compiled stylesheet while standalone Tailwind
  compiled it fine. It was a stale `.next` from this session's first dev run.
  Symptom: computed styles show `max-width: none` for rules that exist in
  source. Fix: stop dev, move `.next` aside, restart.
- **`display: contents` breaks sibling combinators.** It flattens _layout_,
  not DOM structure. Every Elementor paragraph sits alone inside its own
  wrapper, so `.wp-content > * + *` matched nothing and all prose margins
  were `0px` — the apparent spacing was line-height alone. Prose rhythm now
  uses per-element `margin-block-end`. Do not reintroduce `+` or `~`
  selectors in `.wp-content`.
- **Full-page screenshots do not wait for many remote images.** A 54-image
  gallery reads as a blank band in the capture while `painted: 54/54` and
  `broken: 0` in the DOM. Verify layout numerically, not from the screenshot.
- **`String.replace` passes the match offset** as the second callback arg
  when the pattern has no capture group, so a `= ""` default never applies.
  This silently replaced matches with integers in the first cut of
  `prepareWpContent`.
- **Do not "fix" WP permalinks before cutover.** See the open items below.
- **`generateStaticParams` must return `{ slug: [...] }` objects**, not bare
  segment arrays. Bare arrays are silently ignored: the build succeeds,
  reports SSG, and prerenders nothing.
- **Two WordPress pages have a null `uri` in WPGraphQL** — the posts page
  (`goscie`) and the WooCommerce shop page (`sklep`). URI lookups 404 them
  even though they serve fine on WordPress. They need explicit routes.
- **oxfmt reads `.gitignore`**, and `schema.gql` is deliberately un-ignored
  there, so it reformatted 35k lines of generated output that codegen then
  rewrites. `.prettierignore` keeps it out.
- **`eslint-plugin-sonarjs` needs `globals`** without declaring it. Without
  it the plugin fails to load entirely, so its rules silently never run and
  lint passes locally while failing on a clean install.
- **Guest photos live only in `featuredImage`.** The 25 guest posts have
  zero images inside `content`, so any template rendering only `content`
  silently drops every photo. `PostQuery` must select `featuredImage`.
- **`research/current-content.md` is a 2026-07-02 snapshot and has drifted.**
  Its partner list (Powergraph, Rebis, Radio Eska, Informator Konwentowy) no
  longer matches the live page. Re-scrape before treating it as truth.
- **Asset filenames lie.** The partner logo at `2026/07/kepler.png` is the
  **Planetarium Wenus** mark. Open the image before naming an organisation.
- **Most partner logos are dark on transparent** and disappear on the navy
  surface. They need a light plate. Only Planetarium Wenus (white on red)
  survives directly on dark.

## Key implementation notes

- `src/utils/nextSlugToWpSlug.ts` maps clean paths to the `/index.php/…`
  URIs WPGraphQL actually resolves. Without it every page 404s: a lookup for
  `czas-i-miejsce` returns `null`, `/index.php/czas-i-miejsce/` returns the
  page. Delete this and its test once permalinks are fixed at cutover.
- `src/utils/prepareWpContent.ts` strips carousel ARIA
  (`aria-roledescription="carousel"`, slide roles, `1 z 11` labels) because
  the design renders those slides as a static grid, so the carousel
  semantics would be a lie to screen readers.
- Editors author in Elementor. Its wrappers are neutralised with
  `display: contents` in `globals.css` and the semantic children inherit the
  design system. Widget vocabulary is small: `text-editor`, `image`,
  `heading`, `image-carousel`, one Google map, one button.
- Galleries past 12 slides get a contact-sheet grid via
  `:has(.swiper-slide:nth-child(13))`. This took one gallery from 4206px to
  809px.
- `src/components/Globals/siteNav.ts` holds the real scraped IA. Header is 6
  links + Akredytacja CTA on one line (72px); the full grouped site map lives
  in the footer, which avoids a mega-dropdown and the JS it needs. Mobile is
  a native `<details>` disclosure, verified at 390px.
- Deleted as dead scaffold: `Navigation.tsx` + its CSS module,
  `PostTemplate.module.css`.

## Open work

Completed this session: env flip + codegen (1), codegen unblock (14),
design system (4), navigation (5), legacy redirects (3), content parity
(6), guest posts (7), e2e suite (16), CI (17).

1. **#2 Permalinks — DO NOT DO BEFORE CUTOVER.** Pretty permalinks 404
   live, meaning the server rewrite is broken. Switching to "Post name" now
   would rewrite every live URL while WordPress is still the public
   frontend and could 404 the shop mid-accreditation-sales.
2. **#8** `/wspieraja-nas` partner grid, 4 tiers. Pull original logos from
   `wp-content/uploads`, not the Elementor thumbs.
3. **#9** `/sklep` + `/produkt/[slug]` on WooGraphQL. Browse is ours;
   **cart, checkout and Paynow stay on WooCommerce.** The footer currently
   links out to the live shop as a stopgap, since the WordPress shop page
   has a null uri and cannot be resolved by URI.
4. **#10** Home page. The key art (`baner_strona_1300x500.jpg`) is still
   unused and belongs here as the hero. `/` currently renders a hardcoded
   placeholder. News source today is a Facebook embed, not WP posts — the
   user has asked for the embed.
5. **#11** Wire the revalidation webhook. `src/app/api/revalidate/route.ts`
   exists but nothing calls it. Content is cached for an hour, so without
   it edits take up to an hour to appear.
6. **#12** Ludamus programme feed + `/program`. Independent of content work.
   Also owed to Ad Astra: an organizer onboarding video.
7. **#13** Cutover: DNS, `wp.` subdomain, redirects, shop exemptions.
8. **#15** Low priority: several pages use bare paragraphs as section labels
   (`POCIĄGIEM`, `AUTOBUSEM`) instead of headings, invisible to
   screen-reader heading navigation. Editorial fix in WordPress, not CSS.

Also unresolved: Vercel GitHub app access to the `zagrajmy` org (blocks
auto-deploy), and `bun run lint` (bare `oxlint`) hangs — scope it to
directories as a workaround.

## 🟢 Malware incident — cleaned 2026-07-10, verified clean 2026-07-27

Compromised ~2.5 years (oldest artifacts Feb 2023), serving hidden
darknet-market SEO spam injected in the PHP render path, not the database.
Entry vector confirmed as **CVE-2023-5360** in Royal Elementor Addons
(malware found in its `wpr-addons` upload dir).

Cleaned via Wordfence 2026-07-10 after a full UpdraftPlus backup. 17 malware
files: `wp-includes/functions.php` (modified core, the injector — repaired),
`uploads/wpr-addons/forms/{wp.php8,hyrywi.php}`, and webshells at webroot
`j0edlm.php` / `ripjad.php` / `l3x2gq.php`, `wp-admin/{njjinw,yzliyz}.php`,
`wp-includes/js/jquery/{nmrknj,zdnmnj}.php`, `wp-includes/l10n/index.php`,
`uploads/2023/{02,03,04,05}/*.php`, plus fake plugin dirs
`plugins/{ntfiow,mge0nd}/`. Compromise was file-level only — no rogue admins,
`yodi` verified safe.

Hardening still open:

1. Rotate admin passwords + wp-config salts; rotate hosting/DB creds
   (hosting is **dhosting.pl**, account `yodi`).
2. Plugin/theme updates flagged: EmbedPress, Ashe theme, Smart Slider 3,
   Event Tickets, Google for WooCommerce. Add WooGraphQL to the manual-update
   watch list (no auto-updates, see above).
3. Google Search Console: security check + request reindex.
4. Keep spot-checking for re-infection. Spam returning means persistence
   outside the webroot and needs dhosting panel access.
5. A Wordfence in-panel re-scan is still worth one look (the 2026-07-27
   verification was external only).

Wordfence free, license on the `kobold.zagrajmy` shared mailbox. Site is
behind Cloudflare — note that Cloudflare 403s non-browser user agents, so
scripted checks need a browser UA.

## Suggested skills

- `impeccable` and `emil-design-eng` — used for the design system; reuse for
  the home page hero and the shop. The craft floor and the animation
  framework are the valuable parts.
- `agent-browser` — verifying rendered output and scraping assets. Note its
  `viewport` subcommand is not available in the installed version; use
  `playwriter` when you need to control viewport size.
- `playwriter` — driving wp-admin (the user stays signed in) and viewport
  testing. Its `page.click()` on WordPress settings forms crashes the relay
  mid-navigation; use `form.requestSubmit()` inside `page.evaluate()` and
  verify the result out-of-band.
- `code-review` / `security-review` — before the first real-content deploy,
  and for the revalidate webhook.
