# My + Session DTO Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor `app/my` + `features/my` + `shared/session` to DTO-first contracts while preserving current UI behavior.

**Architecture:** Use a two-level contract strategy: `shared/session` exposes global neutral session contracts (`Session*`), and `features/my` composes those into My-page-specific DTOs (`My*DTO`). Keep DB row awareness inside session/service layers only.

**Tech Stack:** TypeScript, Next.js App Router, React Query, Supabase, FSD

---

## Locked Constraints
1. UI output/interaction/copy must remain unchanged.
2. `shared/session` must not expose DB row types as public contracts.
3. `features/my` owns My-page display/form DTOs.
4. Query keys and invalidation behavior must stay stable.
5. Do not stage unrelated workspace changes (especially external docs edits).
6. Phase-by-phase commits are required.
7. Completed plan/design docs must be moved to `docs/plans/complete/`.

## Baseline Guard
### Task 0: Baseline Verification

**Files:**
- Modify: none

**Step 1: Check workspace state**

Run: `git status --short`
Expected: may include unrelated files; record and avoid staging them.

**Step 2: Run lint baseline**

Run: `npm run lint`
Expected: pass (warnings acceptable).

**Step 3: Run build baseline**

Run: `npm run build`
Expected: pass.

**Step 4: Commit**
- No commit for baseline.

---

## Phase 1. Shared Session Contract Foundation
### Task 1: Add Session Contract Types + Mappers

**Files:**
- Create: `src/shared/session/mappers.ts`
- Modify: `src/shared/session/types.ts`
- Modify: `src/shared/session/index.ts`
- Test: `npm run build`

**Step 1: Add neutral session contract types**
- In `src/shared/session/types.ts`, add:
  - `SessionProfile`
  - `SessionUser`
  - `UpdateSessionProfileInput`
  - `SessionAccountInfo` (if needed for account form)

**Step 2: Implement DB row -> session mapper helpers**
- In `src/shared/session/mappers.ts`, add:
  - `profileRowToSessionProfile(row)`
  - `sessionProfileToProfileUpdate(input)`

**Step 3: Export mapper and contracts from barrel**
- Update `src/shared/session/index.ts` exports.

**Step 4: Verify**

Run: `npm run build`
Expected: pass.

**Step 5: Commit**

```bash
git add src/shared/session/types.ts src/shared/session/mappers.ts src/shared/session/index.ts
git commit -m "feat(session): add neutral session contracts and mappers"
```

### Task 2: Migrate Auth Context/Profile Hooks to Session Contracts

**Files:**
- Modify: `src/shared/session/auth-context.tsx`
- Modify: `src/shared/session/profile-hooks.ts`
- Modify: `src/shared/session/types.ts`
- Test: `npm run lint && npm run build`

**Step 1: Update context state type from DB profile to `SessionProfile`**
- `profile` state and context output should use `SessionProfile | null`.

**Step 2: Apply row->session mapping in fetch paths**
- In `auth-context.tsx`, map fetched row via `profileRowToSessionProfile`.

**Step 3: Update mutation input contract**
- In `profile-hooks.ts`, mutate with `UpdateSessionProfileInput` and convert via `sessionProfileToProfileUpdate` before DB update.

**Step 4: Keep cache keys/invalidation unchanged**
- Existing `authKeys.profile(userId)` behavior remains same.

**Step 5: Verify**

Run: `npm run lint && npm run build`
Expected: pass.

**Step 6: Commit**

```bash
git add src/shared/session/auth-context.tsx src/shared/session/profile-hooks.ts src/shared/session/types.ts
git commit -m "refactor(session): expose session dto contracts in auth hooks"
```

---

## Phase 2. My Feature DTO Foundation
### Task 3: Add My DTO Contracts and Feature Mappers

**Files:**
- Modify: `src/features/my/model/types.ts`
- Create: `src/features/my/lib/mappers.ts`
- Create: `src/features/my/lib/index.ts`
- Modify: `src/features/my/index.ts`
- Test: `npm run build`

**Step 1: Add My DTO contracts**
- In `src/features/my/model/types.ts`, add:
  - `MyProfileViewDTO`
  - `MyProfileFormDTO`
  - `MyTeamOptionDTO`
  - `MyNotificationSettingsDTO`
  - `UpdateMyProfileInput`

**Step 2: Keep `ProfileData` temporarily for compatibility**
- Mark `ProfileData` as deprecated if needed.

**Step 3: Implement feature mappers**
- In `src/features/my/lib/mappers.ts`, add:
  - `sessionProfileToMyProfileFormDTO`
  - `myProfileFormDTOToUpdateSessionProfileInput`
  - `toMyTeamOptions`
  - `toMyProfileViewDTO`

**Step 4: Export via feature barrels**
- Update `src/features/my/lib/index.ts` and `src/features/my/index.ts`.

**Step 5: Verify**

Run: `npm run build`
Expected: pass.

**Step 6: Commit**

```bash
git add src/features/my/model/types.ts src/features/my/lib/mappers.ts src/features/my/lib/index.ts src/features/my/index.ts
git commit -m "feat(my): add my dto contracts and mapper layer"
```

---

## Phase 3. My Page Migration
### Task 4: Remove Inline Mapping from `app/my/page.tsx`

**Files:**
- Modify: `src/app/my/page.tsx`
- Modify: `src/features/my/ui/profile-card.tsx` (type-only if needed)
- Modify: `src/features/my/ui/profile-setup-modal.tsx` (type-only if needed)
- Test: `npm run lint && npm run build`

**Step 1: Delete inline mapper functions**
- Remove local `profileToFormData` and `formDataToUpdate` from `app/my/page.tsx`.

**Step 2: Use `features/my/lib/mappers` helpers**
- Compose `profile`, `teamOptions`, `displayTeamName` via mapper functions.

**Step 3: Use session contracts from `useAuth` / `useUpdateProfile`**
- Ensure `handleProfileComplete` uses `UpdateMyProfileInput` -> session update mapper.

**Step 4: Preserve UI rendering and interactions**
- Keep same JSX layout and text.

**Step 5: Verify**

Run: `npm run lint && npm run build`
Expected: pass.

**Step 6: Commit**

```bash
git add src/app/my/page.tsx src/features/my/ui/profile-card.tsx src/features/my/ui/profile-setup-modal.tsx
# Only stage files actually changed
git commit -m "refactor(my): migrate my page to dto mapping pipeline"
```

---

## Phase 4. Notification Settings Contract Migration
### Task 5: Convert My Settings Query/Mutation to DTO Contracts

**Files:**
- Modify: `src/features/my/api/queries.ts`
- Modify: `src/features/my/api/mutations.ts`
- Modify: `src/features/my/api/settings-api.ts` (if contract alignment needed)
- Modify: `src/features/my/model/types.ts`
- Modify: `src/features/my/lib/mappers.ts`
- Test: `npm run lint && npm run build`

**Step 1: Change query return type**
- `useUserSettings` returns `MyNotificationSettingsDTO`.

**Step 2: Change mutation contract**
- `useUpdateNotificationSetting` uses My DTO field names; map to DB shape inside API/service boundary.

**Step 3: Keep optimistic update behavior unchanged**
- Preserve `onMutate`/rollback/invalidations.

**Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: pass.

**Step 5: Commit**

```bash
git add src/features/my/api/queries.ts src/features/my/api/mutations.ts src/features/my/api/settings-api.ts src/features/my/model/types.ts src/features/my/lib/mappers.ts
git commit -m "refactor(my): migrate notification settings to dto contracts"
```

---

## Phase 5. My Sub-Page Type Alignment
### Task 6: Align `app/my/*` and My UI to DTO-only Access

**Files:**
- Modify: `src/features/my/ui/bank-account-form.tsx`
- Modify: `src/app/my/account/phone/page.tsx` (if type alignment only)
- Modify: other `src/app/my/*` pages only if required
- Test: `npm run lint && npm run build`

**Step 1: Remove direct DB profile shape assumptions from My UI**
- In `bank-account-form.tsx`, consume session/my DTO contract instead of DB row fields.

**Step 2: Keep behavior unchanged**
- Validation, submit payload semantics, toasts remain same.

**Step 3: Verify no DB row type leaks in my page/ui paths**

Run: `rg -n "@/shared/types/database.types" src/app/my src/features/my`
Expected: no DB row shape usage in `app/my` and My UI paths (allow strict exceptions only if unavoidable and documented).

**Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: pass.

**Step 5: Commit**

```bash
git add src/features/my/ui/bank-account-form.tsx src/app/my
# only changed files
git commit -m "refactor(my): align my sub-pages to dto contracts"
```

---

## Phase 6. Cleanup + Docs Archival
### Task 7: Cleanup Legacy Types/Exports and Archive Completed Docs

**Files:**
- Modify: `src/features/my/model/types.ts`
- Modify: `src/features/my/index.ts`
- Move (when completed):
  - `docs/plans/2026-02-14-my-session-dto-refactoring-design.md` -> `docs/plans/complete/`
  - `docs/plans/2026-02-14-my-session-dto-refactoring-plan.md` -> `docs/plans/complete/`
  - any other completed plan/design docs in this stream

**Step 1: Remove temporary compatibility aliases if unused**
- Delete deprecated My legacy types after consumer migration.

**Step 2: Tighten exports**
- Ensure `features/my` exports DTO-first contracts.

**Step 3: Final gates**

Run:
- `npm run lint`
- `npm run build`

Expected: pass.

**Step 4: Archive completed docs**

Run:
- `mkdir -p docs/plans/complete`
- `git mv docs/plans/2026-02-14-my-session-dto-refactoring-design.md docs/plans/complete/`
- `git mv docs/plans/2026-02-14-my-session-dto-refactoring-plan.md docs/plans/complete/`

**Step 5: Commit**

```bash
git add src/features/my docs/plans/complete
git commit -m "refactor(my): finalize dto migration and archive completed plans"
```

---

## Final Regression Checklist
1. `/my` profile card, edit modal, save flow unchanged.
2. `/my` notification toggle optimistic update unchanged.
3. `/my/payment/bank-account` submit and validation unchanged.
4. `useAuth().profile` consumers compile without DB row coupling.
5. No DB row type leakage in `app/my` and My UI paths.

## Recommended Execution Mode
- Use `superpowers:subagent-driven-development` in this session.
- Execute phase-by-phase and commit at each phase boundary.
