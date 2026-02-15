# FSD Pages Layer

This directory contains page-level composition for the product.

- `src/pages/*` owns route UI composition and data orchestration wiring.
- Next route adapter files (`app/**/page.tsx`) should stay thin and re-export from `@/pages/*`.
- Root special adapters (`app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`) should also re-export from `@/pages/_root/*`.
- FSD app-runtime modules (for example `providers`, `layout-shell`) live in `src/app/*` and are consumed by root `app/layout.tsx`.
- Route groups are used for file organization only:
  - `app/(auth)/*` for login/signup/auth callback routes
  - `app/(main)/*` for home entry and main product routes
- Do not place business composition logic in `app/**`; keep it in `src/pages/*`.
