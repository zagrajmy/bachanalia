#!/usr/bin/env bash
#
# Krok 3 runbooka migracji — przestawia zmienne na Vercelu i wypuszcza build.
#
# Uruchamiać dopiero, kiedy WordPress siedzi już na wp. i ma tam ustawiony
# siteurl. Build generuje wszystkie strony z treści pobranej z WordPressa, więc
# odpalony za wcześnie po prostu nie przejdzie — skrypt sprawdza to sam i
# odmawia startu.

set -euo pipefail

WP=https://wp.bachanaliafantastyczne.pl
BASE=https://bachanaliafantastyczne.pl

die() {
  echo "✗ $1" >&2
  exit 1
}

# Deployujemy zawartość katalogu, nie gałąź na GitHubie — więc musi się zgadzać
# z main, inaczej na produkcję pojedzie czyjeś lokalne pół-roboty.
[ -z "$(git status --porcelain)" ] || die "niezacommitowane zmiany — zacommituj albo schowaj"
git fetch --quiet origin main
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || die "HEAD to nie origin/main"

echo "→ pytam WordPressa na wp., o jakim adresie sam myśli"
settings=$(
  curl -sf --max-time 30 -X POST "$WP/graphql" \
    -H 'content-type: application/json' \
    -d '{"query":"{generalSettings{url}}"}'
) || die "$WP/graphql nie odpowiada — krok 1 nieskończony"

# WPGraphQL may escape slashes (https:\/\/…); match the host, not the raw URL.
case "$settings" in
  *wp.bachanaliafantastyczne.pl*) echo "✓ siteurl wskazuje na wp." ;;
  *) die "siteurl to nadal nie wp. — zrób krok 2a. WordPress odpowiedział: $settings" ;;
esac

set_env() {
  echo "→ $1=$2"
  vercel env rm "$1" production --yes >/dev/null 2>&1 || true
  printf %s "$2" | vercel env add "$1" production >/dev/null
}

set_env NEXT_PUBLIC_WORDPRESS_API_URL "$WP"
set_env NEXT_PUBLIC_WORDPRESS_API_HOSTNAME "${WP#https://}"
set_env NEXT_PUBLIC_BASE_URL "$BASE"

echo "→ build bez cache (NEXT_PUBLIC_* są wkompilowane, redeploy jest obowiązkowy)"
vercel deploy --prod --force

echo
echo "✓ gotowe. Zanim ruszysz apeks (krok 4), sprawdź na bachanalia.vercel.app:"
echo "  - zdjęcia w treści starego wpisu"
echo "  - sklep pokazuje produkty, koszyk działa"
