# Application Feature DTO Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor `features/application` to DTO-first contracts without changing any existing behavior.

**Architecture:** Keep `features/application` as an independent user-scenario feature. Move all UI conversion logic into feature mappers, keep DB-shape handling in API boundary, and expose DTO contracts to UI/hooks.

**Tech Stack:** TypeScript, React Query, Next.js App Router, Supabase, FSD

---

## Locked Constraints
1. Existing UI behavior/copy/validation/interaction must remain identical.
2. Query keys and invalidation behavior must remain unchanged.
3. `match-create` is out of scope.
4. Avoid DB row type leakage into `features/application/ui/*`.
5. Commit at each phase boundary.

## Baseline Guard
### Task 0: Baseline verification

**Files:**
- Modify: none

**Step 1: Confirm workspace state**

Run: `git status --short`
Expected: clean or unrelated changes only.

**Step 2: Baseline lint**

Run: `npm run lint`
Expected: pass (warnings allowed).

**Step 3: Baseline build**

Run: `npm run build`
Expected: pass.

---

## Phase 1. DTO Foundation
### Task 1: Add DTO contracts and mapper module

**Files:**
- Modify: `src/features/application/model/types.ts`
- Create: `src/features/application/lib/mappers.ts`
- Create: `src/features/application/lib/index.ts`
- Modify: `src/features/application/index.ts`
- Test: `npm run build`

**Step 1: Add DTO contracts**
- Add to `src/features/application/model/types.ts`:
  - `ApplyFormDTO`
  - `ApplyCompanionDTO`
  - `CreateApplicationDTO`
  - `UserApplicationItemDTO`
  - `UserTeamOptionDTO`
  - `ApplyModalViewDTO`
- Keep legacy `Applicant` as compatibility type (or mark deprecated if retained).

**Step 2: Add mapper helpers**
- Create `src/features/application/lib/mappers.ts` with:
  - `sessionProfileToApplyFormDTO(...)`
  - `buildProfileUpdateFromApplyForm(...)`
  - `buildCreateApplicationDTO(...)`
  - `toUserApplicationItemDTO(...)`
  - `toUserTeamOptionDTO(...)`

**Step 3: Export mapper APIs**
- Create `src/features/application/lib/index.ts` re-exports.
- Update `src/features/application/index.ts` to export DTO contracts + mappers.

**Step 4: Verify**

Run: `npm run build`
Expected: pass.

**Step 5: Commit**

```bash
git add src/features/application/model/types.ts src/features/application/lib/mappers.ts src/features/application/lib/index.ts src/features/application/index.ts
git commit -m "feat(application): add dto contracts and mapper layer"
```

---

## Phase 2. API Contract Migration
### Task 2: Convert queries/mutations to DTO contracts

**Files:**
- Modify: `src/features/application/api/queries.ts`
- Modify: `src/features/application/api/mutations.ts`
- Test: `npm run lint && npm run build`

**Step 1: Query return DTO conversion**
- `useUserApplications` return type: `Promise<UserApplicationItemDTO[]>`
- `useUserTeams` return type: `Promise<UserTeamOptionDTO[]>`
- Map raw query rows through application mappers.

**Step 2: Mutation input DTO conversion**
- Change `useCreateApplication` mutation input to `CreateApplicationDTO`.
- Keep internal call to `createApplicationService.createApplicationV2(...)` unchanged.

**Step 3: Invalidation behavior parity**
- Keep existing `applicationKeys` + `matchKeys` invalidation logic unchanged.

**Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: pass.

**Step 5: Commit**

```bash
git add src/features/application/api/queries.ts src/features/application/api/mutations.ts
git commit -m "refactor(application): migrate api contracts to dto types"
```

---

## Phase 3. Apply Modal DTO Migration
### Task 3: Move apply-modal conversion logic to mappers

**Files:**
- Modify: `src/features/application/ui/apply-modal.tsx`
- Modify: `src/features/application/model/types.ts` (type-only adjustments if needed)
- Modify: `src/features/application/lib/mappers.ts` (if mapper gaps found)
- Test: `npm run lint && npm run build`

**Step 1: Replace local conversion functions**
- Remove/replace inline conversion helpers in `apply-modal.tsx`.
- Use `sessionProfileToApplyFormDTO`, `buildProfileUpdateFromApplyForm`, `buildCreateApplicationDTO`.

**Step 2: Preserve behavior exactly**
- Keep required validation, companion add/remove logic, agreement gate, and submit flow unchanged.
- Keep same button enabled/disabled behavior and text.

**Step 3: Verify via static checks**
- Ensure no `database.types` import remains in `src/features/application/ui/apply-modal.tsx`.

**Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: pass.

**Step 5: Commit**

```bash
git add src/features/application/ui/apply-modal.tsx src/features/application/lib/mappers.ts src/features/application/model/types.ts
git commit -m "refactor(application): migrate apply modal to dto mapper pipeline"
```

---

## Phase 4. Cleanup + Tight Exports
### Task 4: Remove compatibility remnants and lock DTO-first API

**Files:**
- Modify: `src/features/application/model/types.ts`
- Modify: `src/features/application/index.ts`
- Modify: `src/features/application/api/queries.ts` (if final cleanup needed)
- Modify: `src/features/application/api/mutations.ts` (if final cleanup needed)
- Test: `npm run lint && npm run build`

**Step 1: Remove deprecated aliases (if unused)**
- Remove legacy compatibility types that are no longer referenced.

**Step 2: Tighten public exports**
- Ensure `features/application` exports DTO-first contracts and mapper helpers.

**Step 3: Final checks**
- `rg -n "@/shared/types/database.types" src/features/application/ui`
Expected: no matches.

**Step 4: Verify**

Run:
- `npm run lint`
- `npm run build`

Expected: both pass.

**Step 5: Commit**

```bash
git add src/features/application
git commit -m "refactor(application): finalize dto migration and tighten exports"
```

---

## Regression Checklist
1. Apply modal opens/closes as before.
2. Required field validation unchanged.
3. Companion add/remove/edit unchanged.
4. Empty profile fields auto-save before apply unchanged.
5. Application creation and cancel flow unchanged.
6. Existing toast and invalidation behavior unchanged.

## Recommended Execution Mode
- Use `superpowers:subagent-driven-development` in this session.
- Execute phase-by-phase with review checkpoints and per-phase commits.
