# Przepięcie domeny

tldr: WordPress przenosi się na `wp.bachanaliafantastyczne.pl`. Apeks i `www` idą na
Vercela.

Między krokiem 2 a 3 `bachanalia.vercel.app` nie działa. Tak ma być.
`bachanaliafantastyczne.pl` odpowiada cały czas, najpierw jako stara, potem jako
nowa strona.

## Przed startem

- [x] Apeks i `www` dodane do projektu na Vercelu, `www` z przekierowaniem 308 na
      apeks. Certyfikatów jeszcze nie ma i mieć nie może — Vercel wystawia je
      dopiero, gdy domena zaczyna do niego prowadzić. Stąd kolejność w kroku 4.
- [x] Ustawienia → Rewalidacja strony, „Wyślij testowy sygnał" świeci na zielono
      na dzisiejszym adresie. W kroku 4 zostaje wtedy tylko podmienić adres.
- [x] Kupon testowy założony według opisu w kroku 2d
- [x] Przekierowania `/wp-content`, `/wp-includes`, `/wp-admin`, `/wp-login.php`
      wdrożone na Vercelu
- [x] Proxy powiadomień Paynow odpowiada. POST na
      `bachanalia.vercel.app/?wc-api=WC_Gateway_Pay_By_Paynow_PL` wraca
      z WordPressa, z nagłówkiem `x-turbo-charged-by: LiteSpeed` i kodem 400,
      czyli wtyczka odrzuca podrobiony podpis. O to chodziło: żądanie dochodzi
      w całości.

## Cloudflare

- [ ] Upewnić się, że tryb SSL/TLS to nie Flexible. Full i Full (strict) działają
      oba. Flexible łączy się z originem po HTTP, Vercel odbija to na HTTPS
      i wychodzi pętla przekierowań.
- [ ] Żadna reguła nie cache'uje HTML-a. Domyślnie Cloudflare tego nie robi i tak
      ma zostać, bo inaczej rewalidacja odświeży stronę, a ludzie i tak dostaną
      starą wersję z cache'u.

## 1. `wp.bachanaliafantastyczne.pl` na dhosting

Rekord bez proxy, szara chmurka. Zapytania z Vercela do WordPressa idą POST-em, a
Cloudflare odpowiada takim klientom challengem w HTML-u pod kodem 200, co sklep
widzi jako awarię.

Samo DNS nie wystarczy. `wp.` musi wejść do panelu dhostingu jako domena, inaczej
trafiamy na domyślny vhost.

Czekamy na certyfikat:

- [ ] `https://wp.bachanaliafantastyczne.pl/wp-admin` bez ostrzeżenia
- [ ] `https://wp.bachanaliafantastyczne.pl/graphql` odpowiada, choćby błędem
      GraphQL-a

## 2. WordPress

### a) Ustawienia → Ogólne

Adres WordPressa i Adres witryny na `https://wp.bachanaliafantastyczne.pl`.

Tu można się zatrzasnąć. Miej otwarte SSH albo FTP, ratunek to `wp-config.php`:

```php
define( 'WP_HOME', 'https://wp.bachanaliafantastyczne.pl' );
define( 'WP_SITEURL', 'https://wp.bachanaliafantastyczne.pl' );
```

Profilaktycznie tego nie wpisujemy, bo te stałe wyszarzają pola w Ustawieniach.

Od tej chwili `www` przekierowuje na `wp.`, bo robi to WordPress. Do kroku 4 to
bez znaczenia.

### b) Linki absolutne w bazie

Wtyczka Better Search Replace, `bachanaliafantastyczne.pl` na
`wp.bachanaliafantastyczne.pl`, wszystkie tabele. Nie SQL-em, `REPLACE` psuje
serializowane pola meta.

Teraz, przed buildem. Build zapiecze w sobie takie adresy zdjęć, jakie w tym
momencie są w bazie.

### c) LiteSpeed Cache → Purge All

Serwer trzyma wygenerowane strony tydzień
(`x-litespeed-cache-control: public,max-age=604800`). Bez purge'a serwuje dalej
HTML z adresami apeksu i test w punkcie (d) pokaże bzdury.

### d) Test kasy

Kupon mamy.

- zniżka procentowa 90%. Przy zerowej kwocie WooCommerce uznaje zamówienie za
  darmowe, chowa wszystkie bramki i powiadomienie z Paynow nigdy nie leci, czyli
  test omija dokładnie to, co ma sprawdzić.
- ograniczony do produktu Wsparcie Klubu 20 zł, więc test kosztuje 2 zł
  niezależnie od tego, kto go klika
- limit użyć 2, ważny do dnia po migracji

Minimum transakcji w Paynow to 1 zł dla każdej metody, więc rabat musi zostawić
na koszyku co najmniej tyle.

Na `wp.`:

- [ ] koszyk prowadzi do kasy na `wp.` i formularz się pokazuje
- [ ] Paynow jest pierwszą i zaznaczoną metodą
- [ ] płatność wraca na `/index.php/zamowienie/order-received/...`
- [ ] zamówienie w wp-admin ma status opłacone. To jedyny dowód, że powiadomienie
      z Paynow dochodzi.
- [ ] link do biletu otwiera prawdziwy PDF

Powiadomienie idzie tu prosto do WordPressa, bo apeks to nadal on. Ten test nie
dotyka drogi przez Vercela. Sprawdza ją dopiero zakup po przepięciu.

## 3. Vercel

```sh
./scripts/cutover-env.sh
```

Trzy zmienne i build bez cache. Najpierw sprawdza, czy `siteurl` wskazuje już na
`wp.`, i odmawia startu, jeśli nie.

Ręcznie: `NEXT_PUBLIC_WORDPRESS_API_URL` na
`https://wp.bachanaliafantastyczne.pl`, `NEXT_PUBLIC_WORDPRESS_API_HOSTNAME` na
`wp.bachanaliafantastyczne.pl`, `NEXT_PUBLIC_BASE_URL` na
`https://bachanaliafantastyczne.pl`, potem redeploy bez „use existing build
cache".

- [ ] build przechodzi
- [ ] na `bachanalia.vercel.app` ładują się zdjęcia w treści starego wpisu
- [ ] sklep pokazuje produkty, koszyk działa

Apeks nadal stoi na dhostingu, więc to ostatni moment, żeby coś poprawić
niezauważenie.

## 4. Apeks i `www` na Vercela

Vercel nie ma jeszcze certyfikatu na te domeny i dostanie go dopiero, kiedy ruch
zacznie do niego docierać. Dlatego najpierw szara chmurka, potem pomarańczowa:

1. Przepiąć apeks i `www` na Vercela **bez proxy**, szara chmurka.
2. Poczekać, aż `https://bachanaliafantastyczne.pl` otworzy się bez ostrzeżenia
   o certyfikacie. Zwykle trwa to chwilę. Bez tego nie ma po co iść dalej.
3. Włączyć proxy z powrotem, pomarańczowa chmurka.

Od tego momentu zmiana originu wchodzi od razu i tak samo szybko się cofa, bez
czekania na propagację DNS. W punktach 1 i 2 tego udogodnienia nie ma, bo przy
szarej chmurce liczy się TTL rekordu, czyli 300 sekund.

Przekierowanie `www` na apeks jest już ustawione po stronie Vercela. Do tej pory
robił to WordPress.

Zaraz potem Ustawienia → Rewalidacja strony, adres strony Next.js na
`https://bachanaliafantastyczne.pl`.

- [ ] „Wyślij testowy sygnał" świeci na zielono

To musi być po przepięciu apeksu. Wcześniej apeks to nadal WordPress, więc sygnał
poleciałby w tę samą maszynę.

## Po wszystkim

- [ ] drugi zakup, tym razem przez `bachanaliafantastyczne.pl`, i znowu status
      opłacone w wp-admin. Dopiero tędy powiadomienie idzie przez Vercela. Stąd
      limit dwóch użyć na kuponie.
- [ ] `X-Robots-Tag: noindex` albo `Disallow: /` w `robots.txt` na `wp.`, inaczej
      Google zaindeksuje starą stronę jako duplikat
- [ ] mapa strony Yoasta na `wp.` wyłączona, jeśli Yoast działa
- [ ] stary wpis: zdjęcia w treści i link do PDF-a otwierają się
- [ ] `bachanaliafantastyczne.pl/wp-admin` przerzuca na `wp.`

## Do posprzątania później

Panel Paynow przez mBank, Ustawienia → Sklepy i punkty płatności → Adres
powiadomień:

```
https://wp.bachanaliafantastyczne.pl/?wc-api=WC_Gateway_Pay_By_Paynow_PL
```

To jedno pole na cały sklep i wskazuje na apeks. Dopóki tak zostaje, każde
powiadomienie o płatności nadkłada drogi przez Vercela i proxy na `/`, zamiast
trafiać prosto do WordPressa.

Adresu powrotu nie ruszamy, wtyczka ustawia go sama przy każdym zamówieniu.

Odłożenie tego kroku ma sens tylko wtedy, gdy proxy odpowiada, a to sprawdza
punkt w „przed startem". Jeśli jest tam czerwono, adres w Paynow zmieniamy
jeszcze przed przepięciem apeksu.

## Linki absolutne

Adresy stron przechodzą przepięcie bez zmian: Next.js odtwarza te same ścieżki
i przekierowuje `/index.php/*`.

Zdjęcia i załączniki mają w treści wpisów zapisany adres absolutny, a
`/wp-content/uploads/*` na Vercelu nie istnieje. Łapie je przekierowanie na
`wp.`, które obejmuje też linki spoza naszego zasięgu: stare maile z biletami,
posty na Facebooku, wyniki w Google.

Search-replace z kroku 2b zmienia te adresy w bazie, żeby świeża treść szła
prosto na `wp.`, bez dodatkowego skoku.

Warianty zdjęć w `/_img` i placeholdery są kluczowane ścieżką bez domeny, więc
przepięcie ich nie rusza.

## Cofanie

1. Origin apeksu i `www` z powrotem na dhosting. Za proxy działa od razu.
2. `siteurl` i `home` z powrotem na apeks, search-replace w drugą stronę.
3. Zmienne na Vercelu z powrotem, redeploy.

Baza to jedyne miejsce, którego nie cofa redeploy. Kopia przed krokiem 2b.
