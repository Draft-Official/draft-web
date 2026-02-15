# FSD Pages Layer

This directory contains page-level composition for the product.

- `src/pages/*` owns route UI composition and data orchestration wiring.
- Next route adapter files (`app/**/page.tsx`) should stay thin and re-export from `@/pages/*`.
- Do not place business composition logic in `app/**`; keep it in `src/pages/*`.
