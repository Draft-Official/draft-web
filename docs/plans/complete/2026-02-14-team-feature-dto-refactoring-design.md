# Team Feature DTO Refactoring Design

## Goal
Refactor `features/team` to the same DTO pipeline used in match/schedule:
`DB Row -> Entity -> DTO -> UI`.

- Keep UI behavior and presentation unchanged
- Migrate incrementally with small reversible phases
- Align naming and boundaries with strict FSD rules used in this project

## Scope
- `features/team` full migration (core + membership + match paths)
- Rename only `api/core` to `api/team-info`
- Keep `api/membership`, `api/match` folder names unchanged

## Non-Negotiable Constraints
1. No UI format/appearance/copy changes.
2. Refactoring targets data contracts and type flow only.
3. Query/mutation behavior and invalidation semantics must remain unchanged.
4. DTO contracts live in `features/team/model/types.ts`.
5. UI files must stop depending directly on DB row types.

## FSD Data Flow
1. Query in `features/team/api/*/queries.ts`
2. Convert DB row to entity via `entities/*` mappers
3. Compose entities in `features/team/lib/mappers.ts`
4. Return DTO from query hooks
5. Consume DTO in `features/team/ui/*`

## Entity Usage Policy
- Team feature is allowed to use multiple entities as needed:
  - `entities/team`
  - `entities/match`
  - `entities/application`
  - `entities/user`
  - `entities/gym`
- Rule: all rows are mapped to entity first, then composed into DTO.
- UI consumes DTO only.

## Naming Decisions
- `src/features/team/api/core/*` -> `src/features/team/api/team-info/*`
- Keep:
  - `src/features/team/api/membership/*`
  - `src/features/team/api/match/*`
- DTO names use explicit domain intent (no ambiguous generic names).

## DTO Strategy
1. Keep existing feature contracts temporarily as compatibility aliases where needed.
2. Introduce explicit DTO sets for:
- team-info (team detail/profile/list)
- membership (members/pending/membership)
- team-match/voting (list/detail/vote summary/my vote)
3. Remove legacy view-models only after all UI consumers migrate.

## Migration Phases (Recommended)
### Phase 1
- Add DTO contracts in `features/team/model/types.ts`
- Add `features/team/lib/mappers.ts` for entity-to-dto composition
- Keep compatibility aliases

### Phase 2
- Rename `api/core` -> `api/team-info`
- Update exports/imports in `features/team/api/index.ts`, `features/team/index.ts`, consumers
- Ensure no behavior change

### Phase 3
- Migrate `team-info` query hooks to DTO return types
- Migrate `membership` query hooks to DTO return types
- Migrate `match` query hooks to DTO return types

### Phase 4
- Migrate UI consumers in team detail/schedule/members/match screens to DTO props
- Remove direct DB type usage from UI

### Phase 5
- Cleanup: remove legacy view-model types and dead mapper branches
- Tighten public exports

## Verification
1. Build gate:
- `npm run build` passes

2. Type-flow checks:
- No `features/team/ui/*` direct dependency on DB row types
- team query hooks return DTO types only

3. Regression smoke:
- Team detail page (home/schedule/members)
- Membership flows (pending/approve/reject/role)
- Team match voting flows (list/detail/my vote/summary)

## Expected Outcome
- Team feature follows the same DTO architecture as match/schedule
- Clear entity-vs-dto boundaries
- Stable, explicit UI contracts without visual regressions
