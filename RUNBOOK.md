# Przepięcie domeny

WordPress przenosi się na `wp.bachanaliafantastyczne.pl`. Apeks i `www` idą na
Vercela.

Kod rabatowy do testów zakupu: `test-domeny-2026`.

Między krokiem 2 a 3 `bachanalia.vercel.app` nie działa. Tak ma być. Stara strona
odpowiada cały czas, od kroku 2 pod adresem `wp.`.

## Przed startem

- [ ] Apeks i `www` dodane do projektu na Vercelu, certyfikaty wystawione
- [ ] Ustawienia → Rewalidacja strony, „Wyślij testowy sygnał" świeci na zielono
      na dzisiejszym adresie. W kroku 4 zostaje tylko podmienić adres, zamiast
      zgadywać przez telefon, czy sekret w ogóle kiedykolwiek był ustawiony.
- [ ] Jest dostęp do panelu Paynow, czyli do mBanku firmowego (krok 2d)
- [ ] Przekierowania `/wp-content`, `/wp-includes`, `/wp-admin`, `/wp-login.php`
      wdrożone na Vercelu

## Cloudflare

- [ ] SSL/TLS na Full (strict)
- [ ] Żadna reguła nie cache'uje HTML-a. Domyślnie Cloudflare tego nie robi i tak
      ma zostać, bo inaczej rewalidacja działa, a ludzie widzą starą stronę.

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
HTML z adresami apeksu i test w punkcie (e) pokaże bzdury.

### d) Paynow: adres powiadomień

Panel Paynow przez mBank, Ustawienia → Sklepy i punkty płatności → Adres
powiadomień:

```
https://wp.bachanaliafantastyczne.pl/?wc-api=WC_Gateway_Pay_By_Paynow_PL
```

To jedno pole na cały sklep i wskazuje na apeks. Zostawione tak, po kroku 4
przyjmuje je Vercel, który nie ma pojęcia, co z tym zrobić: kupujący płaci,
zamówienie zostaje nieopłacone, bilet się nie wystawia, i nic o tym nie krzyknie.

Adresu powrotu nie ruszamy, wtyczka ustawia go sama przy każdym zamówieniu.

### e) Test kasy

Na `wp.`, kod `test-domeny-2026`:

- [ ] koszyk prowadzi do kasy na `wp.` i formularz się pokazuje
- [ ] Paynow jest pierwszą i zaznaczoną metodą
- [ ] płatność wraca na `/index.php/zamowienie/order-received/...`
- [ ] zamówienie w wp-admin ma status opłacone. To jedyny dowód, że powiadomienie
      z Paynow dochodzi.
- [ ] link do biletu otwiera prawdziwy PDF

Jeśli kod zbija do zera i Paynow przy zerowej kwocie znika, kup za złotówkę.

## 3. Vercel

```sh
./scripts/cutover-env.sh
```

Trzy zmienne i build bez cache. Najpierw pyta WordPressa na `wp.`, o jakim
adresie sam myśli, i odmawia startu, jeśli `siteurl` to nadal apeks.

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

Pomarańczowa chmurka zostaje. Za proxy zmiana originu wchodzi od razu i tak samo
szybko się cofa, bez czekania na propagację DNS.

`www` na 308 do apeksu. Apeks jest kanoniczny, tak ustawia `NEXT_PUBLIC_BASE_URL`.
Do tej pory przekierowanie robił WordPress, od teraz Vercel.

Zaraz potem Ustawienia → Rewalidacja strony, adres strony Next.js na
`https://bachanaliafantastyczne.pl`.

- [ ] „Wyślij testowy sygnał" świeci na zielono

To musi być po przepięciu apeksu. Wcześniej apeks to nadal WordPress, więc sygnał
poleciałby w tę samą maszynę.

## Po wszystkim

- [ ] `X-Robots-Tag: noindex` albo `Disallow: /` w `robots.txt` na `wp.`, inaczej
      Google zaindeksuje starą stronę jako duplikat
- [ ] mapa strony Yoasta na `wp.` wyłączona, jeśli Yoast działa
- [ ] stary wpis: zdjęcia w treści i link do PDF-a otwierają się
- [ ] `bachanaliafantastyczne.pl/wp-admin` przerzuca na `wp.`

## Linki absolutne

Adresy stron przeżywają przepięcie, bo Next.js odtwarza te same ścieżki i
przekierowuje `/index.php/*`. Nie przeżywa `/wp-content/uploads/*`, bo tej
ścieżki na Vercelu nie ma.

Zdjęcia i załączniki w treści wpisów mają w bazie adres absolutny, więc po kroku
4 każde z nich to 404. Stąd dwie rzeczy naraz:

- search-replace (krok 2b) naprawia treść, którą kontrolujemy,
- przekierowanie `/wp-content/:path*` na `wp.` ratuje resztę: stare maile z
  biletami, posty na Facebooku, wyniki w Google.

Warianty zdjęć w `/_img` i placeholdery są kluczowane ścieżką bez domeny, więc
przepięcie ich nie rusza.

## Cofanie

1. Origin apeksu i `www` z powrotem na dhosting. Za proxy działa od razu.
2. `siteurl` i `home` z powrotem na apeks, search-replace w drugą stronę.
3. Zmienne na Vercelu z powrotem, redeploy.

Baza to jedyne miejsce, którego nie cofa redeploy. Kopia przed krokiem 2b.
