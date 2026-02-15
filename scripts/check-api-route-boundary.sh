#!/bin/sh
set -eu

collect_api_route_files() {
  if [ -d app ]; then
    rg --files app | rg '^app/api/.+/route\.ts$' || true
    return
  fi

  if [ -d src/app ]; then
    rg --files src/app | rg '^src/app/api/.+/route\.ts$' || true
  fi
}

api_route_files="$(collect_api_route_files)"

if [ -z "$api_route_files" ]; then
  echo "OK: no api route files found."
  exit 0
fi

tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT
printf "%s\n" "$api_route_files" > "$tmp_file"

# API routes must not depend on UI/model/entity layers directly.
forbidden_pattern="from '@/(entities/|widgets/|pages/|app-layer/|features/.*/(ui|api|model|lib)(/|'))"
forbidden_violations="$(xargs -I{} rg -n "$forbidden_pattern" "{}" < "$tmp_file" || true)"

if [ -n "$forbidden_violations" ]; then
  echo "ERROR: api route boundary violations detected:"
  echo "$forbidden_violations"
  exit 1
fi

# Alias imports from API routes are restricted to shared and feature server use-cases.
all_alias_imports="$(xargs -I{} rg -n "from '@/" "{}" < "$tmp_file" || true)"
non_allowed_alias_imports="$(printf "%s\n" "$all_alias_imports" | rg -v "from '@/(shared/|features/.+/server/)" || true)"

if [ -n "$non_allowed_alias_imports" ]; then
  echo "ERROR: api routes must import only from @/shared/* or @/features/*/server/*:"
  echo "$non_allowed_alias_imports"
  exit 1
fi

echo "OK: no api route boundary violations detected."
