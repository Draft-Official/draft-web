# Team Feature DTO Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor `features/team` to strict DTO flow (`DB Row -> Entity -> DTO -> UI`) without changing existing UI behavior, while renaming `api/core` to `api/team-info`.

**Architecture:** This migration follows the same incremental pattern used in `features/match` and `features/schedule`: introduce DTO contracts first, map query outputs to DTOs, migrate UI props to DTO-only, then remove legacy view-models. All DB-shape awareness stays in service/entity mapping layers, and UI consumes flattened, display-ready DTOs only.

**Tech Stack:** TypeScript, Next.js App Router, React Query, Supabase, FSD Architecture

---

## Locked Constraints
1. UI output must remain unchanged (layout/text/interaction behavior).
2. `src/features/team/api/core/*` must be renamed to `src/features/team/api/team-info/*`.
3. `src/features/team/api/membership/*` and `src/features/team/api/match/*` names remain unchanged.
4. Team feature may compose multiple entities (`team`, `match`, `application`, `user`, `gym`) when required.
5. Every phase ends with `lint + build` and a commit.

## Baseline Verification (Before Phase 1)
### Task 0: Capture Baseline

**Files:**
- Modify: none

**Step 1: Confirm clean workspace**

Run: `git status --short`
Expected: no output

**Step 2: Run lint baseline**

Run: `npm run lint`
Expected: command succeeds (existing warnings are acceptable if non-blocking)

**Step 3: Run build baseline**

Run: `rm -rf .next && npm run build`
Expected: build completes successfully

---

## Phase 1. DTO Foundation (Types + Team Feature Mappers)
### Task 1: Add Team DTO Contracts in `model/types.ts`

**Files:**
- Modify: `src/features/team/model/types.ts`
- Modify: `src/features/team/model/index.ts`
- Modify: `src/features/team/index.ts`

**Step 1: Add DTO section (new interfaces only)**

Add DTO interfaces near top of `types.ts`:
- `TeamInfoDTO`
- `MyTeamListItemDTO`
- `TeamMembershipDTO`
- `TeamMemberListItemDTO`
- `TeamScheduleMatchItemDTO`
- `TeamVoteDTO`
- `TeamMatchDetailDTO`
- `MyPendingTeamVoteMatchDTO`

**Step 2: Keep legacy models but mark deprecated**

Mark existing feature view-models as deprecated with JSDoc:
- `TeamMatchWithVoting`
- `TeamProfileCardData`
- `TeamListItem`
- `LegacyTeamCard`
- `LegacyMatchCard`

**Step 3: Update barrel exports**

Expose new DTO types from:
- `src/features/team/model/index.ts`
- `src/features/team/index.ts`

**Step 4: Type-check after contracts**

Run: `rm -rf .next && npm run build`
Expected: build succeeds (no runtime behavior changes yet)

**Step 5: Commit**

```bash
git add src/features/team/model/types.ts src/features/team/model/index.ts src/features/team/index.ts
git commit -m "feat(team): add dto contracts for team feature"
```

### Task 2: Add Team Feature Formatters and Entity-to-DTO Mappers

**Files:**
- Create: `src/features/team/lib/formatters.ts`
- Create: `src/features/team/lib/mappers.ts`
- Create: `src/features/team/lib/index.ts`

**Step 1: Create formatter helpers**

Implement formatter functions for display fields (no UI changes):
- `formatTeamRegion(regionDepth1, regionDepth2)`
- `formatTeamRegularSchedule(regularDay, regularStartTime, regularEndTime)`
- `formatTeamAgeRange(ageRange)`
- `formatTeamLevelRange(levelRange)`

**Step 2: Create DTO mapper functions**

Implement composition functions:
- `toTeamInfoDTO(teamEntity, extras)`
- `toMyTeamListItemDTO(teamEntity, extras)`
- `toTeamMembershipDTO(memberEntity, userEntityOrNull)`
- `toTeamScheduleMatchItemDTO(matchEntity, gymEntityOrNull)`
- `toTeamVoteDTO(applicationEntity, userEntityOrNull)`
- `toTeamMatchDetailDTO(matchEntity, gymEntityOrNull, teamEntityOrNull)`
- `toMyPendingTeamVoteMatchDTO(matchEntity, teamEntity, myVoteEntityOrNull, summary)`

**Step 3: Export mapper/formatter barrels**

Export from `src/features/team/lib/index.ts` and consume via feature-local imports.

**Step 4: Verify compile**

Run: `rm -rf .next && npm run build`
Expected: build succeeds

**Step 5: Commit**

```bash
git add src/features/team/lib/formatters.ts src/features/team/lib/mappers.ts src/features/team/lib/index.ts
git commit -m "feat(team): add dto formatters and mappers"
```

---

## Phase 2. Rename `core` to `team-info`
### Task 3: Rename API Folder and Update Imports

**Files:**
- Move: `src/features/team/api/core/queries.ts` -> `src/features/team/api/team-info/queries.ts`
- Move: `src/features/team/api/core/mutations.ts` -> `src/features/team/api/team-info/mutations.ts`
- Move: `src/features/team/api/core/index.ts` -> `src/features/team/api/team-info/index.ts`
- Modify: `src/features/team/api/index.ts`
- Modify: all imports using `@/features/team/api/core/*`:
  - `src/app/my/page.tsx`
  - `src/app/team/[code]/match/create/page.tsx`
  - `src/app/team/[code]/matches/[matchId]/page.tsx`
  - `src/features/team/ui/my-teams-tab.tsx`
  - `src/features/team/ui/team-detail-view.tsx`
  - `src/features/team/ui/components/detail/pending-members-view.tsx`
  - `src/features/team/ui/components/detail/team-profile-edit-view.tsx`
  - `src/features/team/ui/components/detail/team-settings-view.tsx`
  - `src/features/team/ui/team-create-form.tsx`

**Step 1: Rename directory and files**

Move folder `core` to `team-info`.

**Step 2: Update team API barrel**

In `src/features/team/api/index.ts`, replace `export * from './core'` with `export * from './team-info'`.

**Step 3: Update all app/feature import paths**

Replace `api/core/...` imports with `api/team-info/...`.

**Step 4: Verify rename integrity**

Run: `rg -n "api/core" src`
Expected: no remaining references

**Step 5: Run lint + build**

Run: `npm run lint && rm -rf .next && npm run build`
Expected: both succeed

**Step 6: Commit**

```bash
git add src/features/team/api src/app src/features/team/ui
git commit -m "refactor(team): rename core api module to team-info"
```

---

## Phase 3. Team-Info Query DTO Migration
### Task 4: Convert `team-info/queries.ts` Return Types to DTO

**Files:**
- Modify: `src/features/team/api/team-info/queries.ts`
- Modify: `src/features/team/api/team-info/mutations.ts`
- Modify: `src/features/team/model/types.ts` (if DTO fields need adjustment)
- Modify: `src/features/team/lib/mappers.ts` (if missing mapping branches)

**Step 1: Red step (type-first)**

Change query signatures:
- `useTeam`: `Promise<TeamInfoDTO | null>`
- `useTeamByCode`: `Promise<TeamInfoDTO | null>`
- `useMyTeams`: `Promise<MyTeamListItemDTO[]>`

Run: `rm -rf .next && npm run build`
Expected: type errors before mapper wiring

**Step 2: Green step (mapper wiring)**

Apply `teamRowToEntity` + `toTeamInfoDTO` / `toMyTeamListItemDTO` in query functions.

**Step 3: Keep cache behavior unchanged**

Ensure React Query keys and invalidation remain exactly same in `mutations.ts`.

**Step 4: Verify**

Run: `npm run lint && rm -rf .next && npm run build`
Expected: success

**Step 5: Commit**

```bash
git add src/features/team/api/team-info/queries.ts src/features/team/api/team-info/mutations.ts src/features/team/lib/mappers.ts src/features/team/model/types.ts
git commit -m "refactor(team): migrate team-info queries to dto outputs"
```

---

## Phase 4. Membership Query DTO Migration
### Task 5: Convert Membership Queries to DTO Contracts

**Files:**
- Modify: `src/features/team/api/membership/queries.ts`
- Modify: `src/features/team/api/membership/mutations.ts`
- Modify: `src/features/team/model/types.ts`
- Modify: `src/features/team/lib/mappers.ts`

**Step 1: Red step (signature migration)**

Change query signatures:
- `useTeamMembers`: `Promise<TeamMemberListItemDTO[]>`
- `usePendingMembers`: `Promise<TeamMemberListItemDTO[]>`
- `useMyMembership`: `Promise<TeamMembershipDTO | null>`

Run: `rm -rf .next && npm run build`
Expected: type errors until mapping is applied

**Step 2: Green step (entity + DTO composition)**

Use:
- `teamMemberRowToEntity` for base membership
- `userRowToEntity` when joined user exists
- `toTeamMembershipDTO` mapper output

**Step 3: Preserve mutation payload behavior**

Mutations can keep existing return payloads if UI contract unchanged, but cache data set by membership keys must match new DTO query types.

**Step 4: Verify**

Run: `npm run lint && rm -rf .next && npm run build`
Expected: success

**Step 5: Commit**

```bash
git add src/features/team/api/membership/queries.ts src/features/team/api/membership/mutations.ts src/features/team/lib/mappers.ts src/features/team/model/types.ts
git commit -m "refactor(team): migrate membership queries to dto contracts"
```

---

## Phase 5. Team-Match Query DTO Migration
### Task 6: Convert Match/Vote Queries to DTO Contracts

**Files:**
- Modify: `src/features/team/api/match/queries.ts`
- Modify: `src/features/team/api/match/mutations.ts`
- Modify: `src/entities/team/api/team-service.ts` (typed joined row aliases if needed)
- Create: `src/entities/application/api/mapper.ts` (if missing row->entity mapper)
- Modify: `src/entities/application/index.ts` (export mapper)
- Modify: `src/features/team/lib/mappers.ts`
- Modify: `src/features/team/model/types.ts`

**Step 1: Add/complete missing entity mappers**

If absent, add `applicationRowToEntity` in `entities/application` to avoid DB-row coupling in feature layer.

**Step 2: Red step (query signatures first)**

Change signatures:
- `useTeamMatches`: `Promise<TeamScheduleMatchItemDTO[]>`
- `useTeamMatch`: `Promise<TeamMatchDetailDTO | null>`
- `useTeamVotes`: `Promise<TeamVoteDTO[]>`
- `useMyVote`: `Promise<TeamVoteDTO | null>`
- `useMyPendingVoteMatches`: `Promise<MyPendingTeamVoteMatchDTO[]>`

Run: `rm -rf .next && npm run build`
Expected: type errors before mapper composition

**Step 3: Green step (entity -> dto mapping)**

Apply entity-first flow:
- Match rows -> `matchRowToEntity`
- Team rows -> `teamRowToEntity`
- Application rows -> `applicationRowToEntity`
- User rows -> `userRowToEntity`
- Gym rows -> `gymRowToEntity`
- Compose DTOs via `src/features/team/lib/mappers.ts`

**Step 4: Keep mutation orchestration unchanged**

Do not alter mutation semantics or invalidation keys in `match/mutations.ts`.

**Step 5: Verify**

Run: `npm run lint && rm -rf .next && npm run build`
Expected: success

**Step 6: Commit**

```bash
git add src/features/team/api/match/queries.ts src/features/team/api/match/mutations.ts src/entities/team/api/team-service.ts src/entities/application/api/mapper.ts src/entities/application/index.ts src/features/team/lib/mappers.ts src/features/team/model/types.ts
git commit -m "refactor(team): migrate team match queries to dto pipeline"
```

---

## Phase 6. UI DTO Migration (No Visual Change)
### Task 7: Update Team UI Components to DTO Props Only

**Files:**
- Modify: `src/features/team/ui/team-detail-view.tsx`
- Modify: `src/features/team/ui/my-teams-tab.tsx`
- Modify: `src/features/team/ui/components/detail/team-schedule-tab.tsx`
- Modify: `src/features/team/ui/components/detail/team-home-tab.tsx`
- Modify: `src/features/team/ui/components/detail/team-detail-header.tsx`
- Modify: `src/features/team/ui/components/match/team-match-detail-view.tsx`
- Modify: `src/features/team/ui/components/match/team-hero-section.tsx`
- Modify: `src/features/team/ui/components/match/team-facility-section.tsx`
- Modify: `src/features/team/ui/components/match/team-voting-section.tsx`
- Modify: `src/features/team/ui/components/match/voting-accordion.tsx`
- Modify: `src/app/team/[code]/matches/[matchId]/page.tsx`
- Modify: `src/app/team/[code]/match/create/page.tsx` (type alignment only)

**Step 1: Replace DB row imports in UI**

Remove `@/shared/types/database.types` imports from team UI match/detail paths and replace with DTO imports from `@/features/team/model/types`.

**Step 2: Remove inline shape casting**

Delete `(match as { gyms?: ... })` style casts by using flattened DTO fields.

**Step 3: Keep rendered output stable**

Do not change className/text/layout/order; only change data access path.

**Step 4: Verify DB-type leakage is removed**

Run: `rg -n "@/shared/types/database.types" src/features/team/ui`
Expected: no `Match`/`Application` DB row type usage in team UI

**Step 5: Verify**

Run: `npm run lint && rm -rf .next && npm run build`
Expected: success, no UI regression from type-flow changes

**Step 6: Commit**

```bash
git add src/features/team/ui src/app/team/[code]/matches/[matchId]/page.tsx src/app/team/[code]/match/create/page.tsx
git commit -m "refactor(team): migrate team ui components to dto props"
```

---

## Phase 7. Cleanup Legacy Paths and Models
### Task 8: Remove Dead Compatibility Layer and Tighten Exports

**Files:**
- Remove: `src/features/team/api/mapper.ts` (if no longer used)
- Modify: `src/features/team/api/index.ts`
- Modify: `src/features/team/index.ts`
- Modify: `src/features/team/model/types.ts`
- Modify: `src/features/team/model/index.ts`
- Modify: related imports in:
  - `src/features/team/ui/components/detail/team-home-tab.tsx`
  - `src/features/team/ui/components/detail/team-detail-header.tsx`

**Step 1: Move or delete legacy feature mapper helpers**

Move remaining reusable helpers into `src/features/team/lib/formatters.ts`, then remove `src/features/team/api/mapper.ts` when unused.

**Step 2: Remove deprecated aliases no longer used**

Delete legacy view-model types from `model/types.ts` after all consumers migrated.

**Step 3: Tighten public API**

Ensure feature exports are DTO-first and avoid leaking DB-row dependent contracts.

**Step 4: Verify cleanup**

Run:
- `rg -n "LegacyTeamCard|LegacyMatchCard|TeamMatchWithVoting|TeamListItem" src/features/team`
- `rg -n "@/features/team/api/mapper" src`
Expected: no remaining runtime references

**Step 5: Final quality gates**

Run:
- `npm run lint`
- `rm -rf .next && npm run build`

Expected: both pass

**Step 6: Commit**

```bash
git add src/features/team
git rm -f src/features/team/api/mapper.ts
git commit -m "refactor(team): finalize dto migration and remove legacy models"
```

---

## Final Regression Checklist
1. My page team card + pending vote list unchanged (`/my`).
2. Team detail tabs (home/schedule/members) unchanged (`/team/[code]`).
3. Team match detail voting flows unchanged (`/team/[code]/matches/[matchId]`).
4. Team creation and team match creation flows unchanged.
5. No team UI component depends on DB row shapes directly.

## Recommended Execution Mode
- Use `superpowers:subagent-driven-development` in this session.
- Execute phase-by-phase and commit at each phase boundary.
