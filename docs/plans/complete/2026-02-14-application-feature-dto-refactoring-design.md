# Application Feature DTO Refactoring Design

## Goal
Refactor `features/application` to DTO-first contracts while preserving all current behavior in apply flow UI.

- Keep UI copy/interaction/validation unchanged
- Align with existing DTO migration pattern used in `match`, `schedule`, `my`
- Isolate DB shape assumptions to API boundary/mappers only

## Scope
- `src/features/application/*`

Out of scope:
- `features/match-create`
- UI redesign
- Business rule changes (application creation/cancel semantics)

## Constraints
1. Existing behavior must not change.
2. Feature remains independent (`features/application` is kept).
3. Query keys and invalidation semantics remain unchanged.
4. `apply-modal` keeps existing UX and text.
5. No DB row shape assumptions in Application UI components.

## Architecture
### Layer Responsibilities
- `model/types.ts`: Application feature DTO contracts only
- `lib/mappers.ts`: `SessionProfile`/form/participants mapping helpers
- `api/queries.ts`: DTO return contracts
- `api/mutations.ts`: DTO input contracts (DB shape conversion in API boundary)
- `ui/apply-modal.tsx`: DTO consumption only, no conversion logic

### Boundary Rule
`DB row/entity -> Application DTO -> UI`

## Data Flow
1. Load session/team data:
- `useAuth().profile` (`SessionProfile`)
- `useUserTeams()`

2. UI init mapping:
- `SessionProfile -> ApplyFormDTO`
- `apply-modal` stores `ApplyFormDTO` + `ApplyCompanionDTO[]`

3. Submit pre-processing:
- `ApplyFormDTO + SessionProfile -> UpdateSessionProfileInput` (fill only missing profile fields)
- `ApplyFormDTO + companions + SessionProfile -> CreateApplicationDTO` (participants payload)

4. Mutation execution:
- `useUpdateProfile` with session contract
- `useCreateApplication` with DTO input
- Existing invalidation keys unchanged

## DTO Set
1. `ApplyFormDTO`
- `height`, `age`, `weight`, `position`, `teamId`

2. `ApplyCompanionDTO`
- `name`, `position`, `height`, `age`, `skillLevel`

3. `CreateApplicationDTO`
- `matchId`, `userId`, `teamId`, `participants`

4. `UserApplicationItemDTO`
- `matchId`, `status`

5. `UserTeamOptionDTO`
- `id`, `name`, `logoUrl`

6. `ApplyModalViewDTO`
- UI-derived values for modal defaults/derived state

## Incremental Migration Plan
### Phase 1: Foundation
- Add DTO contracts to `features/application/model/types.ts`
- Add `features/application/lib/mappers.ts`
- Keep temporary compatibility aliases only if required

### Phase 2: API Contract Migration
- `useUserApplications` returns `UserApplicationItemDTO[]`
- `useUserTeams` returns `UserTeamOptionDTO[]`
- `useCreateApplication` accepts `CreateApplicationDTO`

### Phase 3: UI Migration
- Remove local conversion logic from `apply-modal`
- Use mapper functions from `features/application/lib/mappers.ts`
- Keep interaction and rendering unchanged

### Phase 4: Cleanup
- Remove compatibility aliases if unused
- Tighten feature exports to DTO-first contracts

## Verification
1. Quality gates
- `npm run lint` (warnings acceptable)
- `npm run build`

2. Regression smoke
- Apply modal open/close unchanged
- Required validation unchanged
- Companion add/remove/edit unchanged
- Profile auto-fill save behavior unchanged
- Application create/cancel flow unchanged

3. Type-flow checks
- No `database.types` import in `features/application/ui/*`
- DTO contracts are the public API for application hooks/components

## Expected Outcome
`features/application` remains small but explicit as user-scenario boundary, with stable DTO contracts and behavior-preserving migration.
