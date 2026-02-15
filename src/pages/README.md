# FSD Pages Layer

This directory contains page-level composition for the product.

- `src/pages/*` owns route UI composition and data orchestration wiring.
- Next route adapter files (`app/**/page.tsx`) should stay thin and re-export from `@/pages/*`.
- Root special adapters (`app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`) should also re-export from `@/pages/_root/*`.
- FSD app-layer runtime modules live under `src/app-layer/*` and are imported via `@/app-layer/*`.
- Do not place business composition logic in `app/**`; keep it in `src/pages/*`.
