# Przepięcie domeny na nową stronę

WordPress przenosi się na `wp.bachanaliafantastyczne.pl`, a `bachanaliafantastyczne.pl`
i `www.` zaczynają wskazywać na Vercela.

Kod rabatowy do testów zakupu: **`test-domeny-2026`**.

Nowa strona może być niedostępna przez czas migracji — między krokiem 2 a 3
`bachanalia.vercel.app` nie działa i tak ma być. Stara strona przez cały czas
odpowiada, najwyżej pod adresem `wp.`.

## Zanim zadzwonimy — po naszej stronie

- [ ] Obie domeny dodane do projektu na Vercelu, certyfikaty wystawione. Robimy to
      **przed** przepięciem DNS, nie w trakcie.
- [ ] `HEADLESS_SECRET` na Vercelu ustawiony i identyczny z sekretem w
      Ustawienia → Rewalidacja strony.
- [ ] Sprawdzone, gdzie Paynow trzyma adres powiadomień (panel merchanta czy
      ustawienia wtyczki). Zob. krok 2d.
- [ ] Wdrożone przekierowania `/wp-content`, `/wp-includes`, `/wp-admin`,
      `/wp-login.php` z apeksu na `wp.` (`next.config.js`). Patrz „Linki
      absolutne" niżej.

## Na początku rozmowy — Cloudflare, czyli Yodi

Do niczego z tego nie mamy dostępu, więc idzie na początek rozmowy, nie do
przygotowań.

- [ ] Sprawdzić, czy któraś reguła cache'uje HTML. Domyślnie Cloudflare tego nie
      robi i tak ma zostać — inaczej rewalidacja (krok 4) niby działa, a ludzie
      i tak widzą starą stronę.
- [ ] Tryb SSL/TLS na **Full (strict)**.

Sprawdzone 2026-08-05, więc nie ma po co szukać: **żadna reguła Cloudflare nie
przepisuje `/index.php/*`** — ta ścieżka odpowiada 200 prosto z WordPressa.
Przekierowanie `www` → apeks też robi WordPress (`x-redirect-by: WordPress`), nie
Cloudflare. Nie ma tu nic do usuwania.

Konsekwencja tego drugiego: po kroku 2a `www` zacznie przekierowywać na `wp.`,
a nie na apeks. Przez czas migracji to bez znaczenia, ale od kroku 4 `www` musi
przejąć Vercel.

Czego **nie** ruszamy: TTL. Apeks i `www` są za proxy (`104.21.90.116`,
`172.67.200.101` to Cloudflare), więc świat rozwiązuje domenę na adresy
Cloudflare i te się nie zmieniają. Zmiana originu działa od razu na brzegu i
cofa się od razu. Nie ma tu propagacji, na którą trzeba czekać — pod warunkiem,
że **zostawimy pomarańczową chmurkę** (krok 4).

## Kolejność

Cztery kroki. Trzyma je razem jedna zasada: WordPress ma być gotowy i mieć w bazie
docelowe adresy, **zanim** poleci build — `NEXT_PUBLIC_*` są wkompilowane w build,
a strony generują się statycznie z treści pobranej z WordPressa. Wtedy wystarczy
jeden build zamiast dwóch.

### 1. `wp.bachanaliafantastyczne.pl` → dhosting

- Rekord DNS **bez proxy Cloudflare (szara chmurka)**. Zapytania z Vercela do
  WordPressa idą POST-em; Cloudflare odpowiada takim klientom challengem w HTML
  pod kodem 200, co sklep widzi jako awarię.
- Sama zmiana DNS nie wystarcza — `wp.` trzeba dodać jako domenę/alias w panelu
  dhostingu, inaczej trafiamy na domyślny vhost.

Czekamy na certyfikat. Dalej ruszamy dopiero, jak oba są zielone:

- [ ] `https://wp.bachanaliafantastyczne.pl/wp-admin` otwiera się bez ostrzeżenia
      o certyfikacie
- [ ] `https://wp.bachanaliafantastyczne.pl/graphql` odpowiada (choćby błędem
      GraphQL-a — chodzi o to, że odpowiada WordPress)

### 2. Cała robota po stronie WordPressa

Od tego momentu `bachanalia.vercel.app` jest zepsuty, aż do kroku 3. Tak ma być.

**a) Ustawienia → Ogólne**

Adres WordPressa (`siteurl`) i Adres witryny (`home`) na
`https://wp.bachanaliafantastyczne.pl`.

To jest krok, w którym można się zamknąć na zewnątrz. Miej otwarte SSH/FTP —
ratunek to wpisanie do `wp-config.php`:

```php
define( 'WP_HOME', 'https://wp.bachanaliafantastyczne.pl' );
define( 'WP_SITEURL', 'https://wp.bachanaliafantastyczne.pl' );
```

Nie wpisujemy tego profilaktycznie — te stałe wyszarzają pola w Ustawieniach.

**b) Linki absolutne w bazie**

Wtyczka **Better Search Replace**, `bachanaliafantastyczne.pl` →
`wp.bachanaliafantastyczne.pl`, we wszystkich tabelach. Nie robimy tego SQL-em —
`REPLACE` psuje serializowane pola meta.

Robimy to teraz, a nie po buildzie: build zapiecze w sobie adresy zdjęć takie,
jakie w tym momencie są w bazie.

**c) LiteSpeed Cache → Purge All**

Serwer trzyma wygenerowane strony przez tydzień (`x-litespeed-cache-control:
public,max-age=604800`). Bez wyczyszczenia dalej serwuje HTML z adresami apeksu,
zapisany przed chwilą — i test w punkcie (e) pokaże bzdury, których nie da się
wytłumaczyć.

**d) Paynow — adres powiadomień**

Jeśli w panelu Paynow albo w ustawieniach wtyczki adres powiadomień wskazuje na
`bachanaliafantastyczne.pl`, przestawiamy na `wp.`.

Inaczej po kroku 4 płatności będą przechodzić, a zamówienia zostaną nieopłacone
i bilety się nie wystawią. Cicha awaria, kosztowna.

**e) Test kasy** — z kodem `test-domeny-2026`, na `wp.`:

- [ ] koszyk → kasa przenosi się na `wp.` i pokazuje formularz
- [ ] Paynow jest pierwszą i zaznaczoną metodą
- [ ] płatność przechodzi i wraca na `/index.php/zamowienie/order-received/...`
- [ ] **zamówienie w wp-admin ma status opłacone** — to jedyne, co dowodzi, że
      webhook Paynow dochodzi
- [ ] link do biletu otwiera się i jest to prawdziwy PDF

Jeśli kod zbija do zera, a Paynow przy zerowej kwocie znika, kup normalnie za
złotówkę. Potwierdzenie webhooka jest ważniejsze niż złotówka.

### 3. Zmienne na Vercelu + redeploy

```sh
./scripts/cutover-env.sh
```

Przestawia trzy zmienne i wypuszcza build bez cache. Najpierw pyta WordPressa
na `wp.`, o jakim adresie sam myśli — jak `siteurl` to nadal apeks, odmawia
startu, bo build i tak by nie przeszedł.

Ręcznie to samo: `NEXT_PUBLIC_WORDPRESS_API_URL` →
`https://wp.bachanaliafantastyczne.pl`, `NEXT_PUBLIC_WORDPRESS_API_HOSTNAME` →
`wp.bachanaliafantastyczne.pl`, `NEXT_PUBLIC_BASE_URL` →
`https://bachanaliafantastyczne.pl`, redeploy **bez** „use existing build cache".

- [ ] build przechodzi
- [ ] `bachanalia.vercel.app` wstaje, zdjęcia w treści wpisów się ładują
- [ ] sklep pokazuje produkty, koszyk działa

Apeks nadal wskazuje na dhosting, więc to ostatni bezpieczny moment na sprawdzenie
wszystkiego. Coś nie gra — poprawiamy i redeployujemy, nikt tego nie widzi.

### 4. Apeks + `www` → Vercel

- **Zostawiamy pomarańczową chmurkę.** Proxy przed Vercelem działa pod warunkiem
  SSL/TLS na Full (strict) — i to ono daje nam natychmiastowe cofnięcie zmiany,
  bo świat cały czas rozwiązuje domenę na te same adresy Cloudflare. Zdjęcie
  proxy odsłania prawdziwy adres z własnym TTL i wtedy dopiero robi się
  propagacja, na którą trzeba czekać.
- `www` → 308 na apeks (kanoniczny jest apeks, tak ustawia `NEXT_PUBLIC_BASE_URL`).
  Do tej pory robił to WordPress, od teraz Vercel.

Zaraz potem, **Ustawienia → Rewalidacja strony**: adres strony Next.js na
`https://bachanaliafantastyczne.pl`.

- [ ] „Wyślij testowy sygnał" zwraca zielony komunikat

To musi być po przepięciu apeksu. Wcześniej apeks to nadal WordPress, więc sygnał
poleciałby w tę samą maszynę i test by nie przeszedł.

### Po wszystkim

- [ ] `X-Robots-Tag: noindex` albo `Disallow: /` w `robots.txt` na `wp.` — inaczej
      Google zaindeksuje całą starą stronę jako duplikat. Kasy to nie dotyczy.
- [ ] Jeśli Yoast jest włączony, wyłączyć jego mapę strony na `wp.`
- [ ] Stary wpis, kilka zdjęć w treści, link do PDF-a — wszystko się otwiera
- [ ] `bachanaliafantastyczne.pl/wp-admin` przerzuca na `wp.`

## Linki absolutne

Adresy stron przeżywają przepięcie — Next.js odtwarza te same ścieżki i
przekierowuje `/index.php/*`. Nie przeżywa **`/wp-content/uploads/*`**: tej
ścieżki na Vercelu nie ma.

Zdjęcia i załączniki w treści wpisów renderują się z absolutnym adresem zapisanym
w bazie, więc po kroku 4 każde z nich to 404. Stąd dwie rzeczy naraz:

- search-replace w bazie (krok 2b) — naprawia treść, którą kontrolujemy;
- przekierowanie `/wp-content/:path*` → `wp.` w `next.config.js` — ratuje linki,
  nad którymi nie panujemy: stare maile z biletami, posty na Facebooku, wyniki
  w Google.

Warianty zdjęć w `/_img` i placeholdery LQIP są kluczowane samą ścieżką, bez
domeny, więc przepięcie ich nie rusza.

## Cofanie

1. Origin apeksu i `www` z powrotem na dhosting. Za proxy to działa od razu,
   bez czekania na propagację.
2. `siteurl` i `home` z powrotem na apeks, search-replace w drugą stronę.
3. Zmienne na Vercelu z powrotem + redeploy.

Nic tu nie jest nieodwracalne, ale search-replace w drugą stronę to jedyny krok,
który dotyka bazy — warto mieć kopię przed krokiem 2b.
