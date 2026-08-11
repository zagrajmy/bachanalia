#!/usr/bin/env bash
# Syntax-check PHP without requiring a host PHP installation.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: wordpress/tools/php-wasm-lint.sh [--include-vendor] <file-or-directory> [...]

Recursively syntax-checks PHP files with @php-wasm/cli. Vendor directories are
skipped by default. Targets must live inside this repository because the WASM
runtime mounts the current working tree, not arbitrary absolute host paths.
EOF
}

include_vendor=false
if [[ "${1:-}" == "--include-vendor" ]]; then
  include_vendor=true
  shift
fi
if [[ $# -eq 0 ]]; then
  usage >&2
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"
tmp_list="$(mktemp)"
trap 'rm -f "$tmp_list"' EXIT

resolve_path() {
  python3 - "$1" <<'PY'
from pathlib import Path
import sys
print(Path(sys.argv[1]).resolve())
PY
}

for target in "$@"; do
  absolute="$(resolve_path "$target")"
  case "$absolute" in
    "$repo_root"|"$repo_root"/*) ;;
    *) echo "Target is outside the repository: $target" >&2; exit 2 ;;
  esac

  if [[ -f "$absolute" ]]; then
    [[ "$absolute" == *.php ]] || { echo "Not a PHP file: $target" >&2; exit 2; }
    printf '%s\n' "$absolute" >> "$tmp_list"
  elif [[ -d "$absolute" ]]; then
    if [[ "$include_vendor" == true ]]; then
      find "$absolute" -type f -name '*.php' -print >> "$tmp_list"
    else
      find "$absolute" \
        \( -type d \( -name vendor -o -name node_modules -o -name .git \) -prune \) -o \
        \( -type f -name '*.php' -print \) >> "$tmp_list"
    fi
  else
    echo "Target does not exist: $target" >&2
    exit 2
  fi
done

sort -u "$tmp_list" -o "$tmp_list"
if [[ ! -s "$tmp_list" ]]; then
  echo "No PHP files found." >&2
  exit 2
fi

count="$(wc -l < "$tmp_list" | tr -d ' ')"
echo "Linting $count PHP file(s) with PHP-WASM..."

while IFS= read -r absolute; do
  relative="${absolute#"$repo_root"/}"
  (
    cd "$repo_root"
    bunx @php-wasm/cli -l "$relative"
  )
done < "$tmp_list"
