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

page_files="$(collect_page_files | sort -u)"

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

# Route adapter must only point to pages layer with re-export pattern.
all_alias_imports="$(xargs -I{} rg -n "from '@/" "{}" < "$tmp_file" || true)"
non_pages_alias_imports="$(printf "%s\n" "$all_alias_imports" | rg -v "from '@/pages/" || true)"

if [ -n "$non_pages_alias_imports" ]; then
  echo "ERROR: route adapters must import only from @/pages/*:"
  echo "$non_pages_alias_imports"
  exit 1
fi

invalid_adapter_files=""
while IFS= read -r file; do
  [ -z "$file" ] && continue
  if ! rg -q "^export \\{ default \\} from '@/pages/.+';?$" "$file"; then
    invalid_adapter_files="${invalid_adapter_files}\n${file}"
  fi
done < "$tmp_file"

if [ -n "$invalid_adapter_files" ]; then
  echo "ERROR: route adapters must use re-export form:"
  printf "%b\n" "$invalid_adapter_files"
  exit 1
fi

echo "OK: no route adapter boundary violations detected."
