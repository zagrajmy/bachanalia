# Cookies

What this site stores on a visitor's machine, and what it hands to someone
else. Kept here so the answer is a file rather than a memory, and so anything
added later has to be added here too.

## Ours

Two, and one of them is not a visitor's.

| Name | Set by | Contents | Lifetime | Flags |
| --- | --- | --- | --- | --- |
| `bf_wc_session` | `src/components/Cart/session.ts` | The WooCommerce session JWT — the bearer credential for a cart and the billing address typed into it. | The token's own `exp`, currently 48h, read out of the JWT so the cookie dies exactly when the cart behind it does. | `httpOnly`, `secure`, `SameSite=Lax`, `path=/` |
| `wp_jwt` | Nothing here — read only, in `src/utils/fetchGraphQL.ts` | An editor's WordPress credential, used to render an unpublished draft. | Whatever set it. | — |

`localStorage` holds one key, `bf-consent`, which is the answer to the banner
below. Not a cookie, never sent anywhere, and written only after someone
clicks.

`bf_wc_session` needs no consent. It is the shopping cart, which is the
worked example in art. 173 ust. 3 Prawa telekomunikacyjnego and in ePrivacy
art. 5(3): storage strictly necessary to deliver a service the subscriber
explicitly asked for. It appears only once someone puts something in a cart.

`wp_jwt` is never issued to a visitor. Preview is an editor pointing a
logged-in browser at `?preview=true`.

## What we do not have

No analytics of any kind — no `@vercel/analytics`, no Speed Insights, no
`gtag`, no `<Script>` tag anywhere in the tree. No `sessionStorage`, and the
one `localStorage` key is the consent answer itself. No advertising, no
A/B testing, no session recording, no
heatmaps. The old site's CookieYes banner was covering Elementor's plugin
stack, essentially none of which came across.

## Third parties

None of these are ours, and all of them arrive through content editors write
in WordPress, so they can reappear on a new page without anyone touching this
repo.

| Where | Who | What it costs the visitor |
| --- | --- | --- |
| `/czas-i-miejsce/` | `maps.google.com` iframe | Google sets `NID`. The only one on a page people actually visit. |
| `/zgloszenia-obslugi/` | `docs.google.com/forms` iframe | Google account cookies. |
| `/sztab-bachanaliowy/` | `miro.com` live embed | Miro's own set. |
| `/` and `/aktualnosci/` | `scontent-*.xx.fbcdn.net` images | No cookie — Meta serves media from a cookieless domain — but every view hands Meta an IP and a referer. Rendered as a plain `<img>`, not through `next/image`. |

## How the iframes are handled

None of them reach a browser with their `src` intact.

`blockThirdPartyEmbeds` in `src/utils/wpEmbeds.ts` runs over every page body
on the way out of `prepareWpContent`. Any `<iframe>` pointing somewhere that
is not ours becomes a placeholder `<div data-embed-src="…">` naming the host
it would have contacted, with a button to load it and a link to open it in a
new tab instead. An editor can paste a new embed into WordPress tomorrow and
it is blocked the same way without anyone touching this repo.

`src/components/Consent/Consent.tsx` is the other half. It counts what is
parked on the page and, only if there is something, offers the standing
choice; granting swaps every placeholder for a real iframe and remembers the
answer in `localStorage` under `bf-consent`. Declining leaves the
placeholders, which are still individually clickable — a one-off click loads
that embed and records nothing. The footer's "Ciasteczka" link reopens the
banner anywhere, so the choice can be taken back.

The state lives in `localStorage` rather than a cookie on purpose: the pages
are statically rendered, so a cookie could not change what the server sends
anyway, and this way the consent mechanism does not itself need consent.

The Facebook images are not covered by any of this. They set no cookie, so
there is nothing to gate; routing them through `next/image` would stop the IP
leak, and has not been done.

## What CookieYes is doing on the old site

Not blocking. Checked against the live page on 2026-08-03:

```
curl -s https://bachanaliafantastyczne.pl/index.php/czas-i-miejsce/ | grep -o '<iframe[^>]*'
<iframe loading="lazy" src="https://maps.google.com/maps?q=Wojska%20Polskiego%2069..."
```

The `src` is intact. There is no `data-cookieblock-src`, which is the
attribute CookieYes's auto-blocker rewrites a tag into, and no `data-cky-tag`.
The only CookieYes on the page is its own banner script from
`cdn-cookieyes.com`. So the map loads and Google is contacted whatever the
visitor clicks — a banner that records a choice it does not act on, which is
worse than no banner, because it claims a consent it never collected.

Not a thing to reproduce.

## After cutover

`wp.bachanaliafantastyczne.pl` keeps checkout, so it sets WooCommerce's own
`wp_woocommerce_session_*`, `woocommerce_cart_hash` and
`woocommerce_items_in_cart`, and Paynow's hosted page sets whatever it sets.
All strictly necessary, all on an origin a banner here would not govern
anyway.
