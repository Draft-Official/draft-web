# FSD App Runtime Layer

This directory contains FSD app-level runtime composition, not Next.js route files.

- `providers.tsx`: global provider composition (query client, auth, cache restore).
- `layout-shell.tsx`: global frame/shell used by root `app/layout.tsx`.

Routing adapters stay in root `app/*` (`page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `not-found.tsx`, `api/**/route.ts`).
