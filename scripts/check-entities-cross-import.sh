#!/usr/bin/env sh
set -eu

if rg -n --glob '*.ts' --glob '*.tsx' "from ['\"]@/entities/" src/entities; then
  echo "ERROR: cross-imports inside src/entities are forbidden by project policy."
  exit 1
fi

echo "OK: no cross-imports detected inside src/entities."
