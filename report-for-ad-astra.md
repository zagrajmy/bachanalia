# Strona Bachanaliów jest zhakowana

## Co się dzieje

Na wielu podstronach (m.in. `czas-i-miejsce`, `organizator`,
`sztab-bachanaliowy`) w kodzie siedzi ukryty blok spamu — reklama darknetowych
sklepów. Większość pisana po rosyjsku (cyrylicą), reklamuje rosyjski market
"Kraken"; linki prowadzą do różnych adresów (`krakenat.cc`, `krakenmaarket.com`).
Na `sztab-bachanaliowy` jest inna, anglojęzyczna kampania (`tryggbitrow.com`).
Bloki są generowane maszynowo, każdy trochę inny. Schowane poza ekranem —
użytkownik ich nie widzi, Google tak. To atak pod pozycjonowanie: pasożytują na
waszej reputacji w wyszukiwarce.

Wasza treść stron w bazie jest czysta — spam nie siedzi w treści, dokleja się
dopiero przy generowaniu strony. Czyli coś na serwerze wstrzykuje go przy
renderowaniu; ten wstrzyknięty kod trzeba znaleźć.

## Jak weszli (prawdopodobnie)

Wtyczka **Royal Elementor Addons** miała głośną dziurę (CVE-2023-5360): wgranie
pliku + założenie konta admina. Dziś macie ją w 1.7.1064, czyli już połataną
(fix był w 1.3.79) — ale prawdopodobnie tędy weszli, zanim zaktualizowaliście.
Drzwi zamknięte, tylko włamywacz zdążył zostawić sobie backdoora w środku.
(Konta adminów, `admin` i `yodi`, są Wasze — lewego konta nie widać. Ale samego
wektora wejścia nie da się już potwierdzić bez logów, to hipoteza.)

Aktualizacje i tak nie pomogły. WordPress, WooCommerce, Elementor są świeże, a
spam dalej leci. Backdoor to osobny plik, łatki go nie ruszają.

## Ryzyko

- **Google** wcześniej czy później ukarze stronę (oznaczenie "zhakowana" albo
  spadek w wynikach).
- **Sklep.** Akredytacje idą przez WooCommerce i Paynow. Dobra wiadomość:
  Paynow to bramka redirectowa — płaci się już na stronie Paynow, więc numery
  kart nie przechodzą przez wasz serwer i nie wyciekną. Gorsza: skoro ktoś ma
  dostęp do plików, może podmienić link do płatności albo samą bramkę i
  przekierować kasę do siebie.
- **Obcy ma dostęp.** Dziś reklama, jutro może być podmiana bramki płatności.

Zwykłemu gościowi wejście na stronę niczym nie grozi — to nie wirus na
komputery odwiedzających.

## Plan

Kolejność ważna: najpierw odcinamy dostęp, potem czyścimy — inaczej wgrają spam
z powrotem.

1. **Backup** plików i bazy na start.
2. **Odcięcie dostępu.** Reset haseł adminów, nowe klucze w `wp-config.php`,
   zmiana haseł serwera/FTP/bazy. Konta w Users przejrzeć przy okazji.
3. **Namierzenie backdoora** (SSH/FTP): pliki PHP w uploadach, ostatnio
   zmieniane pliki, sygnatury (`eval`, `base64_decode`). Motyw i wtyczki
   porównać z czystymi wersjami.
4. **Przeinstalowanie** WordPressa, motywu i wtyczek z oficjalnych źródeł.
   Nieużywane usunąć.
5. **Sprawdzenie** zainfekowanych podstron, zgłoszenie do ponownego skanu w
   Google Search Console.
6. Dopiero potem WPGraphQL i nowa strona.

## Komendy na start

Punkty zaczepienia do namierzenia kodu — z SSH, w katalogu WordPressa (tam gdzie
`wp-config.php`).

```bash
# pliki PHP w uploadach — tam ich być nie powinno
find wp-content/uploads -name '*.php'

# PHP zmienione w ostatnich 120 dniach
find . -name '*.php' -mtime -120 -not -path './wp-content/cache/*'

# typowe sygnatury
grep -rEl 'eval\(|base64_decode|gzinflate|str_rot13|\$_(POST|REQUEST|COOKIE)\[' \
  wp-content/ --include='*.php' | head -50

# mu-plugins — ładują się zawsze, częsta kryjówka
ls -la wp-content/mu-plugins/ 2>/dev/null

# rdzeń vs oryginał (jeśli jest WP-CLI)
wp core verify-checksums
```

Jeśli na serwerze stoi więcej stron, warto puścić to samo z katalogu wyżej —
infekcje lubią przeskakiwać między sąsiadami na jednym koncie.

## Od Was

- Kopie zapasowe na serwerze — są? Z jak dawna najstarsza czysta?
