# Foundation Token Alias Verification (2026-02-19)

## Latest Phase Commits

- `b39e75a` refactor: add brand token utility aliases and replace raw var classes
- `c803922` style: restore foundation-driven shadcn bridge mapping
- `48e5a0d` refactor: replace remaining hardcoded brand/ui colors with token classes
- `2a48ab7` refactor: align seed token config with carrot base and draft alias

## Commands Run

### 1) `npm run check:architecture`

Result: PASS

- `check:entities-cross-import`: PASS
- `check:route-adapter-boundary`: PASS
- `check:api-route-boundary`: PASS

### 2) `npm run build`

Result: BUILD PASS (with known lint environment warning)

- Next build compilation: PASS
- Type check and page generation: PASS
- Known warning:
  - ESLint config load fails due to `eslint-config-next` + `@rushstack/eslint-patch` environment issue
  - This warning existed before and is not introduced by foundation token alias changes

## Scope Verified

- `app/globals.css` imports Foundation and shadcn bridge CSS
- `src/shared/ui/theme/foundation.css` token layer loads successfully
- `src/shared/ui/theme/shadcn-bridge.css` semantic alias mapping resolves
- Brand utility aliases compile across app:
  - `bg-brand-weak`, `bg-brand-weak-pressed`
  - `text-brand`, `text-brand-contrast`
  - `border-brand-stroke-weak`
- Remaining UI hardcoded brand-related colors were replaced with token classes:
  - `orange-*`, `#FEE500`, `#3C1E1E`, `#191F28` usage in UI components/pages
- `seed-tokens.ts` now follows `carrot` base palette + `draft` alias structure for consistency with Foundation CSS

## Notes

- `#FF6600` remains only in palette source definitions (`tailwind.config.ts`, `src/shared/config/seed-tokens.ts`) and is intentional.
