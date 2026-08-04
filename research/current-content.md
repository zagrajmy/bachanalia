# Current site content inventory (scraped 2026-07-02)

Live-browser scrape of bachanaliafantastyczne.pl for content parity of the new
site. Supersedes the search-index guesses in [current-site.md](current-site.md).

## ⚠️ The site appears compromised

Injected SEO spam found in page content (visible in rendered HTML):

- `czas-i-miejsce` and `organizator` — Russian-language darknet-market spam
  ("Kraken" Tor links, FAQ-style paragraphs) prepended/inline with real content.
- `sztab-bachanaliowy` — injected link to `tryggbitrow.com` (do not visit).

Classic WP malware. Implications: change all WP/hosting passwords, audit
plugins/users, clean before installing anything new (WPGraphQL, app passwords).
Migration to headless + locked-down wp-admin becomes more urgent, not less.

## Stack observed

- Theme: **Ashe** (WP Royal) + **Elementor** (partner logos are elementor thumbs)
- **WooCommerce** shop (22 products) — accreditation is sold here
- Homepage news = **embedded Facebook feed** (not WP posts)
- Cookie-consent banner; footer "2026 © ZKD Ad Astra"

## Navigation (live, differs from indexed research)

- INFO: co-to-sa-bachanalia, organizator, sztab-bachanaliowy, czas-i-miejsce, regulamin
- PROGRAM: blok-prelekcyjny, blok-konkursowy, blok-naukowy, rpg, gamesroom,
  retro-gaming, cosplay, blok-komiksowy
- DOŁĄCZ DO NAS: zgloszenia-programu, zgloszenia-obslugi
- WYSTAWCY: poznaj-wystawcow, regulamin-wystawcow-2, zgloszenia-wystawcow
- WSPIERAJĄ NAS, NOCLEGI, SKLEP (+koszyk, zamowienie, zwroty, polityka-prywatnosci)

## Page-by-page

| Page                 | Content                                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/` (home)           | FB feed embed; posts promote programme items ("Autostopem przez fantastykę" series), accreditation launch                                                                               |
| co-to-sa-bachanalia  | About text; ~500–850 attendees; **historical guest list** (see below)                                                                                                                   |
| organizator          | ZKF Ad Astra, Fabryczna 13B, 65-410 Zielona Góra, NIP 973-06-79-285, REGON 971286390, KRS 0000170986; "Napisz do nas"                                                                   |
| sztab-bachanaliowy   | Empty (heading only)                                                                                                                                                                    |
| czas-i-miejsce       | 25–27 IX 2026, UZ kampus B, Wojska Polskiego 69; hours (Fri from 14:00, Sat/Sun from 9:30, building closes 20:00); travel: train/bus/car/plane, MZK lines 5/12/26 and 0/8; free parking |
| regulamin            | Full con rules, ~14k chars                                                                                                                                                              |
| blok-prelekcyjny     | Stub: "sci-fi is this year's theme, details soon"                                                                                                                                       |
| blok-konkursowy      | Short blurb; con currency "Bachele" exchangeable in con shop                                                                                                                            |
| blok-naukowy         | Empty (heading only)                                                                                                                                                                    |
| rpg                  | Blurb; sessions run by "Skrzywienie Fabularne"                                                                                                                                          |
| gamesroom            | Blurb; several hundred games; "Trzymaj Pion" section                                                                                                                                    |
| retro-gaming         | Blurb; lan-party + free play                                                                                                                                                            |
| cosplay              | Full contest rules (2025), signup via paper form in manga&anime room                                                                                                                    |
| blok-komiksowy       | Empty (heading only)                                                                                                                                                                    |
| zgloszenia-programu  | Empty (heading only — 2026 form not up)                                                                                                                                                 |
| zgloszenia-obslugi   | Empty (heading only)                                                                                                                                                                    |
| poznaj-wystawcow     | Empty (heading only — 2026 exhibitors not announced)                                                                                                                                    |
| zgloszenia-wystawcow | Contact: wystawcy@bachanaliafantastyczne.pl                                                                                                                                             |
| wspieraja-nas        | Logo grid by tier (below)                                                                                                                                                               |
| noclegi              | UZ dorm lodging, "details soon, limited places"                                                                                                                                         |
| sklep                | WooCommerce, see below                                                                                                                                                                  |
| polityka-prywatnosci | Privacy policy, ~11k chars                                                                                                                                                              |

## Partners (wspieraja-nas, logos by tier)

- Top: Ad Astra logo (organizer)
- **Współorganizatorzy**: Uniwersytet Zielonogórski
- **Partnerzy**: ZOK (Zielonogórski Ośrodek Kultury)
- **Sponsorzy**: Powergraph, Rebis (publishers)
- **Patroni**: "index" (logo `index-czerne`), Radio Eska, Informator Konwentowy,
  Konwenty Południowe

Logos live in `wp-content/uploads` (some as Elementor thumbs); none link anywhere.

## Historical guests (from co-to-sa-bachanalia)

Maciej Parowski, Peter Watts, Witold Jabłoński, Jakub Ćwiek, Marek Huberath,
Andrzej Ziemiański, Ian R. MacLeod, Bogusław Polch, Jacek Rodek, Ondrej Neff,
Arnold Mostowicz, Łukasz Orbitowski, Jarosław Grzędowicz, Francois Launet,
Maja Kossakowska, Eugeniusz Dębski, Jacek Inglot, Andrzej Drzewiński,
Rafał Dębski, Marek Oramus, Grzegorz Janusz, Michał Cetnarowski, Piotr Cholewa,
Robert Wegner, Rafał Majka, Bartek Biedrzycki, Rafał Kosik, Piotr Kosek,
Krzysztof Koziołek, Michał Cholewa, Tomasz Niewiadomski. (2026 guests not
announced on the site yet.)

## Shop (WooCommerce) — load-bearing, sells 2026 accreditation

- Golden Ticket 250 zł (variants)
- Akredytacja 3-dniowa 100 zł, Piątek 50 zł, Sobota 60 zł, Niedziela 50 zł
- Akredytacja wspierająca Polcon 25–45 zł
- Wsparcie Klubu 1 zł
- Fantazje Zielonogórskie zines (I–XV, ~25 zł)
- 22 products total, cart/checkout/returns pages

The old plan's "redirect entire WP frontend" is wrong — shop routes
(`/sklep`, `/koszyk`, `/zamowienie`, `/moje-konto`, `/zwroty`) must keep
working on the WP domain, or the shop moves elsewhere. Decide in cutover.

## Parity checklist for the new site

- [ ] Home: hero (already have) + news. News source today is Facebook, not WP
      posts — either keep an FB embed, or move news to WP posts as planned.
- [ ] Static pages: co-to-sa, organizator (incl. legal ids), czas-i-miejsce,
      regulamin, polityka-prywatnosci, noclegi.
- [ ] Programme block pages: mostly stubs — programme itself will come from
      ludamus/Zagrajmy; block pages can become sections of one /program page.
- [ ] Cosplay rules page (real content, needs 2026 update by editors).
- [ ] Partners page with 4 tiers + logos (assets in wp-content/uploads).
- [ ] Exhibitors: empty for 2026 so far; keep route, content TBD.
- [ ] Zgłoszenia (programu/obsługi/wystawców): landing pages → ludamus flow /
      email; current pages are empty anyway.
- [ ] Shop: link to WP WooCommerce (kept alive) — see above.
- [ ] Sztab page: empty today; skip unless Ad Astra wants it.
