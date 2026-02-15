# FSD Pages Layer

This directory contains page-level composition for the product.

- `src/page-views/*` owns route UI composition and data orchestration wiring.
- Next route adapter files (`src/app/**/page.tsx` and later `app/**/page.tsx`) should stay thin and re-export from `@/pages/*`.
- Do not create or use `root/pages`; keep all page composition in `src/page-views/*`.
