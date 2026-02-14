# My + Session DTO Refactoring Design

## Goal
Refactor `app/my`, `features/my`, and `shared/session` to strict DTO boundaries:
`DB Row -> (Shared Session Contract DTO) -> (Feature DTO) -> UI`.

- Keep current UI behavior/text/interaction unchanged
- Remove DB row type leakage from `app/my` and `features/my` UI paths
- Keep `shared/session` reusable for all features through neutral session contracts

## Scope
- `src/shared/session/*`
- `src/features/my/*`
- `src/app/my/*`

Out of scope:
- Session/auth provider lifecycle redesign (timeouts/retry semantics remain)
- New UI/UX additions
- Team/Match feature behavior changes

## Constraints
1. No visual/UI behavior changes.
2. `shared/session` must expose common contracts, not feature-specific DTOs.
3. `features/my` owns display/form DTOs for My page.
4. Query/mutation keys and cache invalidation semantics must stay stable.
5. Every implementation phase ends with `lint + build + commit`.
6. Completed plan/design docs are moved to `docs/plans/complete/`.

## FSD-Aligned Boundary Decision
### Shared Session Contracts (Global)
`shared/session` serves all features, so it exposes neutral contracts:
- `SessionUser`
- `SessionProfile`
- `UpdateSessionProfileInput`
- `UserSettingsEntity` (or equivalent neutral settings contract)

This layer can map DB rows internally but must not leak DB table shape as public API.

### My Feature DTOs (Feature-local)
`features/my` exposes screen/form DTOs only for My UI:
- `MyProfileViewDTO`
- `MyProfileFormDTO`
- `MyNotificationSettingsDTO`
- `MyTeamOptionDTO`

My feature composes `SessionProfile` + `team-info DTO` into My page-ready DTOs.

## Data Flow
1. Session fetch/update in `shared/session`:
- DB row fetched from `users` / `user_settings`
- map row to `SessionProfile` / settings contract

2. My page composition in `features/my`:
- map `SessionProfile` -> `MyProfileFormDTO`
- map form DTO -> `UpdateSessionProfileInput`
- compose team options + selected display team into view DTO

3. UI consumption:
- `app/my/page.tsx` and `features/my/ui/*` consume only My/session DTOs
- no direct DB row shape access in page/ui components

## Naming and API Policy
- Keep `shared/session` naming explicit with `Session*` prefixes
- Keep `features/my` naming explicit with `My*DTO`
- Do not export DB row types from `features/my` and `shared/session` public barrels

## Incremental Migration Plan (High-level)
### Phase 1: Session Contract Foundation
- add session contract types + mappers in `shared/session`
- adapt `auth-context.tsx` / `profile-hooks.ts` to session contracts

### Phase 2: My Feature DTO Foundation
- add My DTOs + mappers in `features/my/model` and `features/my/lib`
- keep old `ProfileData` temporarily as compatibility alias if needed

### Phase 3: My Page Migration
- remove inline mappers from `app/my/page.tsx`
- use feature/session mappers + DTO hooks

### Phase 4: Settings DTO Migration
- convert `features/my/api/queries.ts` and `mutations.ts` to neutral contract + My DTO mapping
- preserve optimistic update behavior

### Phase 5: Cleanup and Export Tightening
- remove legacy or duplicate mapping code
- tighten barrel exports to DTO-first contracts
- run doc archival for completed plan/design docs

## Verification
1. Quality gates:
- `npm run lint`
- `npm run build`

2. Type-flow checks:
- `rg -n "@/shared/types/database.types" src/app/my src/features/my src/shared/session`
  - expected: no DB row type usage in `app/my` and My UI paths

3. Regression smoke:
- `/my` profile load/edit
- notification setting toggle
- account/payment sub pages render unchanged

## Expected Outcome
- Session contracts become stable and reusable across all features
- My page becomes DTO-driven like match/team/schedule
- DB coupling is pushed down to service/session mapping boundaries only
