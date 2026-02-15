#!/bin/sh
set -eu

collect_page_files() {
  if [ -d src/app ]; then
    rg --files src/app | rg '/page\.tsx$' || true
  fi

  if [ -d app ]; then
    rg --files app | rg '/page\.tsx$' || true
  fi
}

page_files="$(collect_page_files)"

if [ -z "$page_files" ]; then
  echo "OK: no route adapter page files found."
  exit 0
fi

tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT
printf "%s\n" "$page_files" > "$tmp_file"

forbidden_pattern="from '@/(features/.*/(ui|api|lib|model)|entities/|widgets/)"
violations="$(xargs -I{} rg -n "$forbidden_pattern" "{}" < "$tmp_file" || true)"

if [ -n "$violations" ]; then
  echo "ERROR: route adapter boundary violations detected:"
  echo "$violations"
  exit 1
fi

echo "OK: no route adapter boundary violations detected."
