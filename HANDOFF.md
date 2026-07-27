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

### Nothing is committed

Last commit is `a2e5f52`. The entire session below is uncommitted working
tree: design system, shell components, codegen rework, slug mapper, tests,
plan.md rewrite. `src/gql/schema.gql` is newly tracked (1.1 MB); the
generated `.ts` files stay ignored. Review before committing — the user's
rule is no prod deploy without code review, and the next `vercel deploy`
will serve real WordPress content for the first time.

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
section for the palette and the contrast traps. Fonts: **Sora** (display) +
**IBM Plex Sans** (body), both verified for `latin-ext` before committing —
Polish diacritics are non-negotiable and were checked in the browser.

## Traps that cost time

- **Turbopack caches CSS across dev runs.** The entire `.wp-content` block
  appeared absent from the compiled stylesheet while standalone Tailwind
  compiled it fine. It was a stale `.next` from this session's first dev run.
  Symptom: computed styles show `max-width: none` for rules that exist in
  source. Fix: stop dev, move `.next` aside, restart.
- **`display: contents` breaks sibling combinators.** It flattens *layout*,
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

The task list lives in the session harness, so it is reproduced here.
Completed: env flip + codegen (1), codegen unblock (14), design system (4),
navigation (5).

1. **#2 Permalinks — DO NOT DO BEFORE CUTOVER.** Pretty permalinks 404 live,
   meaning the server rewrite is broken. Switching to "Post name" now would
   rewrite every live URL while WP is still the public frontend and could
   404 the shop mid-accreditation-sales.
2. **#3** Add `/index.php/*` → `/*` 301 in middleware. All inbound link
   equity is on the legacy form.
3. **#6** Verify the 20 WP static pages against the parity checklist in
   `research/current-content.md`. Several are empty in WP today — keep the
   route, render the honest empty state that `PageTemplate` already has.
4. **#7** 25 dated 2025 guest posts. **Assumed decision: migrate as-is** at
   their existing paths. Confirm before cutover. They are last year's
   announcements and will read as current unless the listing separates
   editions; `PostTemplate` already surfaces the date.
5. **#8** `/wspieraja-nas` partner grid, 4 tiers. Pull original logos from
   `wp-content/uploads`, not the Elementor thumbs.
6. **#9** `/sklep` + `/produkt/[slug]` on WooGraphQL. Browse is ours;
   **cart, checkout and Paynow stay on WooCommerce.**
7. **#10** Home page. The key art (`baner_strona_1300x500.jpg`) is still
   unused in the new design and belongs here as the hero. News source today
   is a Facebook embed, not WP posts — undecided.
8. **#11** Wire the revalidation webhook. `src/app/api/revalidate/route.ts`
   exists but nothing calls it.
9. **#12** Ludamus programme feed + `/program`. Independent of content work.
   Also owed to Ad Astra: an organizer onboarding video.
10. **#13** Cutover: DNS, `wp.` subdomain, redirects, shop exemptions.
11. **#15** Low priority: several pages use bare paragraphs as section labels
    (`POCIĄGIEM`, `AUTOBUSEM`) instead of headings, invisible to screen-reader
    heading navigation. Editorial fix in WordPress, not CSS.

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
