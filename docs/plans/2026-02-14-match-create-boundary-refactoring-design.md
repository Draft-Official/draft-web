# Match Create Boundary Refactoring Design

## Goal
Refactor `features/match-create` to follow the project’s strict DTO/FSD boundary rules while preserving existing create/edit behavior.

- Keep all UI behavior/text/interaction unchanged
- Remove feature-internal cross-dependencies used by other features
- Keep orchestration in feature layer, domain persistence in entities layer

## Context from Current Architecture Direction
Recent project plans consistently move to this rule set:
1. `entities/*` are table-scoped and independent
2. `features/*` do JOIN/orchestration and manage DTO contracts
3. UI consumes feature DTOs only (`row -> entity -> dto -> ui`)

Applied references:
- `docs/plans/2026-02-13-fsd-seed-migration-plan.md`
- `docs/plans/2026-02-13-fsd-seed-design-migration-design.md`
- `docs/plans/complete/2026-02-14-match-feature-dto-refactoring-design.md`
- `docs/plans/complete/2026-02-14-team-feature-dto-refactoring-design.md`

## Scope
- `src/features/match-create/*`
- Consumers currently importing internal match-create files from team feature
- Shared extraction for reusable UI parts only

Out of scope:
- Visual redesign
- Business rule changes for create/update
- Team feature full DTO migration

## Core Decision
### 1) Keep `features/match-create` as an independent feature
Do not merge into `features/match` now.

Reason:
- Current project direction favors independent scenario features with DTO contracts.
- `match` is already focused on list/detail consumption path; `match-create` is form-heavy orchestration.
- Merging now increases coupling and migration risk while boundary debt is still unresolved.

### 2) Team match create remains in `features/team`
- Team-specific create/view flows stay in `features/team`.
- Shared neutral UI pieces are extracted to `shared`.
- No `features/team` import from `features/match-create/*` internal paths.

## Target Boundary Rules for Match Create
1. `features/match-create/ui/*` must not call Supabase/entity service directly.
2. `features/match-create/ui/*` must not consume `database.types` row shapes directly.
3. `features/match-create` exposes minimal public API via `index.ts`.
4. Other features import only through public API or shared layer; never internal paths.
5. Reusable neutral pieces move to `shared` with neutral names (no `create` prefix).

## Refactoring Strategy
### Phase A: Boundary cleanup first (no behavior changes)
1. Extract reusable UI pieces currently reused by team feature:
- `SelectedLocationCard`
- `AgeSelector`

Target examples:
- `src/shared/ui/composite/location-card.tsx`
- `src/shared/ui/composite/age-range-selector.tsx`

2. Replace imports in:
- `src/features/team/ui/team-create-form.tsx`
- `src/features/team/ui/components/team-create-step-schedule.tsx`
- `src/features/team/ui/components/team-create-step-traits.tsx`
- `src/features/team/ui/components/match/team-match-create-form.tsx`

3. Shrink `features/match-create/index.ts` exports to public surface only.

### Phase B: Close API/UI boundary inside match-create
1. Move view-level infra calls to feature api hooks:
- edit data fetch
- defaults save side-effect
- user/team bootstrap query

2. Introduce DTO contracts in `features/match-create/model/types.ts` for UI-facing types.

3. Route all conversions through mapper pipeline:
- DB row -> entity mapper (`entities/*`)
- entity -> match-create DTO mapper (`features/match-create/lib/mappers.ts`)

### Phase C: View simplification
1. Split `match-create-view.tsx` into:
- page shell / section composition
- form controller hook (`model`)
- submit payload builder (`lib`)

2. Keep `ui` as composition + rendering.

## Create Placement Decision Matrix
### Option A: Merge into `features/match`
- Pros: single match feature folder
- Cons: huge feature, mixed responsibilities, risk to existing stable DTO flow

### Option B: Keep separate (recommended)
- Pros: scenario boundary clarity, consistent with application/team migration style
- Cons: requires deliberate shared extraction

### Option C: New generic match editor feature now
- Pros: maximum deduplication
- Cons: too broad for current boundary-cleanup objective

Decision: **Option B**

## Verification Criteria
1. No team imports from `@/features/match-create/ui/*` or `@/features/match-create/lib/*` internal paths.
2. No direct `database.types` dependency in `features/match-create/ui/*`.
3. `features/match-create/ui/match-create-view.tsx` has no direct Supabase/service calls.
4. `npm run lint` passes.
5. `npm run build` passes.

## Expected Outcome
- `match-create` remains independent but structurally aligned with strict FSD + DTO architecture.
- Team feature no longer depends on match-create internals.
- Clear path to subsequent view simplification without behavior regression.
