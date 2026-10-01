# Facebook news sync — state and plan

No credentials in this file. Tokens belong in GitHub Actions secrets and Vercel env vars.

## How it works today

`fetchFacebookNews` merges two sources:

- **Live:** `FeedQuery` pulls the rendered content of `/index.php/feed-archiwum/` — an unlinked WP page holding a Smash Balloon shortcode with a 50-post window — and `facebookFeed.ts` parses that markup with regexes (`cff-item`, `data-cff-timestamp`, `cff-text`, `data-img-src-set`).
- **Archived:** `scripts/archive-fb-news.ts` runs daily (GH Actions, 04:17), appends new posts to `src/content/fb-news.json`, mirrors images to `public/fb-news/` because the fbcdn URLs expire, and commits.

Smash Balloon's licence was cancelled, but the plugin is still installed and still fetching — it authenticates with the association's own Meta token, and the licence only gated updates and support. Verified serving fresh posts as of 2026-08-18. Nothing is broken right now.

Failure mode when it does stop: the site keeps building and falls back to the archive JSON, so FB news silently freezes. The only alarm is the archiver's `feed parsed to zero posts, refusing to run`.

## The replacement plugin

`ad-astra-social-bridge` is installed and active alongside Smash Balloon. In-house, built as a full Smash Balloon replacement: OAuth with Meta, Page tokens encrypted at rest, WP→FB/IG publishing with a job queue, feed builder, token health checks.

Its compatibility mode detects Smash Balloon and declines to take over feeds, but keeps importing. Its shortcode renders from a local cache, no Meta call per pageview. The WP homepage already renders from it (`aas-social-card`).

**It imports posts into a real CPT** — `aas_social_item`, in `includes/class-aas-importer.php`:

| field                                                                         | source                                    |
| ----------------------------------------------------------------------------- | ----------------------------------------- |
| `post_date`                                                                   | FB `created_time`                         |
| `post_content`                                                                | full message, untruncated                 |
| `_aas_social_external_id`                                                     | FB post id                                |
| `_aas_social_permalink`                                                       | `permalink_url`                           |
| `_aas_social_image`                                                           | remote fbcdn URL (still expires)          |
| `_aas_social_platform` / `_aas_social_media_type` / `_aas_social_source_page` | facebook \| instagram, post type, page id |

Registered `'public' => false` with no `show_in_rest` and no `show_in_graphql`, which is why it appears in neither `wp/v2/types` nor WPGraphQL.

Scraping the bridge's frontend markup instead is a downgrade and not worth considering: `aas-social-card` carries no timestamp at all, and its text is truncated.

## Options

Keep the archiver in all three — `_aas_social_image` and the Graph API both hand back remote fbcdn URLs that expire, so mirroring and LQIP stay. The shape that survives a WordPress migration is the one already in place: a cron that writes `fb-news.json` and mirrored images into git, with the running site holding no credentials.

### A. Expose the CPT to WPGraphQL — needs WP admin only

```php
add_filter('register_post_type_args', function ($args, $type) {
  if ($type === 'aas_social_item') {
    $args['show_in_graphql'] = true;
    $args['graphql_single_name'] = 'socialItem';
    $args['graphql_plural_name'] = 'socialItems';
  }
  return $args;
}, 10, 2);
```

Meta fields need registering too (`register_graphql_field`). Then point `fetchFacebookNews` at the new query and delete `facebookFeed.ts`, `FeedQuery.ts`, `withLiveImages`, and the `feed-archiwum` dependency.

No secrets anywhere. Keeps WordPress in the news path.

Note: exposing a `public => false` type makes those posts publicly queryable. Fine here — they are already public Facebook posts — but it is deliberate.

### B. Reuse the Page token the bridge already holds — needs FTP

The bridge stores an encrypted Page token in its settings option; the key is derived from constants in `wp-config.php`, so anyone with FTP can decrypt it. See `includes/class-aas-crypto.php` and `AAS_Plugin::connection_page_token`.

It is probably already non-expiring: `exchange_long_lived_user_token` swaps for a long-lived user token first, and Page tokens derived from one of those carry no expiry.

Put it in a GH Actions secret, point the archiver at the Graph call below, and WordPress drops out of the news path entirely without waiting on anyone.

Cost: a borrowed credential the plugin owns. A reconnect in the WP admin, or a password change on the granting account, rotates it out from under us and the failure is silent. Before relying on it — verify it actually returns posts, tell the bridge's maintainer it is in use, and add a staleness alarm to the archiver (fail when nothing new has landed in N days, not only on zero posts).

### C. Our own token — needs a role on the Meta app

Cleanest long term, blocked on access. A System User token from a Business portfolio never expires and is unaffected by the plugin's refreshes. Business portfolios are free; ad spend is the paid part.

## The Graph call (B and C)

Lifted from `includes/class-aas-meta-api.php`:

```
GET /v23.0/{page-id}/feed
  ?fields=id,message,story,created_time,permalink_url,
          attachments.limit(10){media,target,subattachments.limit(10){media,target}}
  &limit=50
```

`created_time` is ISO, `message` is untruncated, `permalink_url` replaces the `pageId/postId` string-building. Only the fetch in `scripts/archive-fb-news.ts` changes — dedupe by id, image mirroring, LQIP and the zero-posts guard are source-agnostic.

## Why the OAuth flow cannot be mirrored in Next.js

Meta matches the redirect URI as a whole URL, not by path. The allowlisted entry points at the WP host, so serving the same path from our domain fails with "URL blocked" before any of our code runs. Only the app dashboard can add another entry.

## Blocked on

Nobody on this side has access to the Meta app. That blocks option C and rules out standing up our own OAuth flow.

**Ask:** a role on the Meta Developer App, and whether the Bachanalia page is claimed by a Meta Business portfolio — System Users are a Business Manager feature, and without a portfolio there is no non-expiring token.

Not urgent. Smash Balloon still works, and options A and B need none of it.

## Reference

- Plugin source is readable through `wp-admin/plugin-editor.php`; FTP also available
- Bridge REST namespace `/wp-json/ad-astra-social/v1/` exposes only the Meta OAuth callback and the data-deletion endpoints — no post data
