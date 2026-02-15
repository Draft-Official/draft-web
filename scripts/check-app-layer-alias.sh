#!/bin/sh
set -eu

violations="$(
  rg -n "@/app/" app src \
    --glob '*.ts' \
    --glob '*.tsx' \
    --glob '*.mts' \
    --glob '*.cts' || true
)"

if [ -n "$violations" ]; then
  echo "ERROR: legacy @/app/* alias usage detected. Use @/app-layer/* instead:"
  echo "$violations"
  exit 1
fi

echo "OK: no legacy @/app/* alias imports detected."
