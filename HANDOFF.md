# Handoff — Bachanalia website (2026-07-02)

Continuation notes for the next session. Project context lives in
[plan.md](plan.md) (architecture, phases) and [research/](research/)
(current-site inventory in `current-content.md` supersedes `current-site.md`).
Read those first; this file only covers state + the active incident.

## State

- Repo: https://github.com/zagrajmy/bachanalia (public), `main`.
- Deployed: https://bachanalia.vercel.app (Vercel project `hasparus-projects/bachanalia`,
  linked via `.vercel/`, CLI deploys — GitHub auto-deploy blocked until the
  Vercel GitHub app gets access to the `zagrajmy` org).
- Stack: Next.js 16 App Router + bun + oxlint (`@hasparus/oxlint-config`) +
  oxfmt + Tailwind v4. Scaffold from Vercel `cms-wordpress` example, trimmed
  to vanilla WPGraphQL (no Yoast/ACF/preview — see commit messages).
- **Placeholder content**: `NEXT_PUBLIC_WORDPRESS_API_URL` on Vercel points at
  `demo.wpgraphql.com` because the real WP has no WPGraphQL yet. `/` renders a
  hardcoded hero. Env vars set on Vercel (all envs): WP URL/hostname,
  `NEXT_PUBLIC_BASE_URL`, `HEADLESS_SECRET` (random, only in Vercel).
- `bun run dev`/`build` need `.env.local` — run `vercel env pull .env.local`.
- oxlint/oxfmt pinned (1.71.0/0.56.0) due to bun `minimum-release-age`.

## Decisions made in conversation (not yet in plan.md)

- ACF demoted: model guests/sponsors with native WP constructs (featured
  image, categories, menu order); add ACF only when a concrete field doesn't fit.
- Nav is hardcoded in `src/components/Globals/Navigation/Navigation.tsx`
  (theme menu-location enums are fragile), from plan.md's v1 site map.
- News source today is a Facebook embed, not WP posts — decide keep-embed vs
  WP posts during Phase 3.
- WooCommerce shop sells 2026 accreditation and uses Paynow
  (`pay-by-paynow-pl`) — it must survive cutover. Frontend redirect must
  exempt `/sklep`, `/koszyk`, `/zamowienie`, `/moje-konto`, `/zwroty`.
  plan.md's cutover section still says "redirect everything" — needs updating.
- Programme + enrollment go through ludamus/Zagrajmy (sphere
  `bachanalia.zagrajmy.net` planned, not yet set up).

## 🔴 Active incident: WP malware (blocks everything WP-side)

The live WordPress serves darknet-market SEO spam. Evidence gathered
2026-07-02 (also summarized in `research/current-content.md`):

- Hidden div `<div style="position:absolute;left:-13537px;width:1000px;">`
  with Russian "Kraken" spam + link to `krakenat.cc`, injected after
  `<div class="main-container">`, before post content, on at least
  `czas-i-miejsce`, `organizator`, `sztab-bachanaliowy` (different text each —
  doorway-style generation). Served to all user agents (no cloaking).
- NOT in the database page content: REST `content.rendered` for the same
  pages is clean → injection happens in the PHP render path (theme file,
  plugin, mu-plugin, or wp_options hook), i.e. there's a backdoor file.
- Software is current (WP 7.0, WooCommerce 10.9.1, Elementor 4.1.4) →
  updates didn't remove persistence.
- Plugins visible in HTML: elementor, royal-elementor-addons,
  custom-facebook-feed-pro, embedpress, pay-by-paynow-pl, presto-player,
  woocommerce. **royal-elementor-addons** had mass-exploited CVE-2023-5360
  (arbitrary upload → rogue admins) — plausible original entry vector.
- REST-visible users: `admin` (id 1), **`yodi`** (id 3) — verify `yodi` is a
  real person; rogue-admin names like this match the RoyalElementor campaigns.
- Site is behind Cloudflare; hosting provider unknown. Payments (Paynow) run
  on the compromised install — treat checkout as at-risk until cleaned.

### Cleanup plan (needs hosting/SFTP access — user has WP admin access)

1. Snapshot first: full file + DB backup (evidence, rollback).
2. Rogue admins: wp-admin → Users; verify `yodi`, remove unknown admins;
   force-reset all passwords; rotate wp-config salts.
3. Find the backdoor (SSH/SFTP or host file manager; WP-CLI if available):
   - `wp core verify-checksums`; reinstall core over itself.
   - `find . -name '*.php' -newermt '2025-01-01'` outside expected paths;
     any `.php` in `wp-content/uploads/`; `wp-content/mu-plugins/`.
   - grep for `eval(`, `base64_decode`, `gzinflate`, `str_rot13`,
     `create_function` in themes/plugins; diff Ashe theme + each plugin
     against fresh wordpress.org copies (custom-facebook-feed-pro is paid —
     diff against vendor zip).
   - wp_options: `wp option list --search='*<script*'`; check widgets,
     Elementor custom code snippets.
4. Delete + reinstall all plugins/themes from clean sources; remove unused ones.
5. Rotate: hosting panel, FTP/SSH, DB password, WP app passwords. Check
   crontab/wp-cron for persistence.
6. Verify: curl the affected pages for the hidden div; Google Search Console
   → Security issues; request reindex of cleaned pages.
7. Only after clean: install WPGraphQL, create app password, continue Phase 2.
8. If hosting access is unavailable or infra is too crusty: nuke-and-pave —
   fresh WP on new hosting, export/import content (REST content is clean),
   reinstall shop. Possibly less work than forensics.

## Next steps (in order)

1. Malware cleanup (above) — user action, agent can guide/verify remotely.
2. User grants Vercel GitHub app access to `zagrajmy` → auto-deploys.
3. Install WPGraphQL on cleaned WP → flip Vercel env vars
   (`NEXT_PUBLIC_WORDPRESS_API_URL`, `_HOSTNAME`) → `bun run codegen` →
   redeploy → real content.
4. Phase 3 (content pages, design) and ludamus feed (plan.md Phase 4) can
   proceed in parallel; update plan.md cutover for the shop exemption.

## Suggested skills

- `frontend-design` / `impeccable` — Phase 3 layout/design work.
- `agent-browser` — re-verify the live site after cleanup (hidden-div check),
  scrape assets (partner logos) when building pages.
- `verify` — before committing nontrivial scaffold changes.
- `security-review` — if writing any auth-adjacent code (revalidate webhook).
