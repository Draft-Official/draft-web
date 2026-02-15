# Match Create DTO + Boundary Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor `features/match-create` to DTO-first contracts and strict feature boundaries without changing current create/edit behavior.

**Architecture:** Keep `features/match-create` as an independent scenario feature. Move UI-facing contracts to DTO types, keep DB/entity orchestration in `features/match-create/api` + mappers, and extract neutral reusable UI to `shared` so other features no longer import match-create internals.

**Tech Stack:** TypeScript, Next.js App Router, React Hook Form, React Query, Supabase, FSD

---

### Task 1: Add Match Create DTO Contracts and Mapper Module

**Files:**
- Modify: `src/features/match-create/model/types.ts`
- Create: `src/features/match-create/lib/mappers.ts`
- Create: `src/features/match-create/lib/index.ts`
- Modify: `src/features/match-create/index.ts`

**Step 1: Define DTO contracts in model types**
- Add `MatchCreateUserDTO`, `MatchCreateTeamOptionDTO`, `RecentMatchListItemDTO`, `EditMatchPrefillDTO`, `OperationsDefaultsDTO` to `model/types.ts`.
- Keep location type export and add local DTO-only types for UI consumption.

**Step 2: Add feature mapper helpers**
- Create `lib/mappers.ts` with row/entity -> DTO conversion helpers.
- Include helpers for:
  - recent match dialog list mapping
  - edit prefill mapping
  - user/team bootstrap mapping

**Step 3: Add lib barrel export**
- Create `lib/index.ts` and export mapper helpers.

**Step 4: Update feature public API exports**
- Export DTO contracts and stable hooks/components only from `index.ts`.
- Remove unnecessary export of internal service/mapper implementation details.

**Step 5: Verify compile constraints**
Run: `npm run lint`
Expected: pass or existing unrelated warnings only.

---

### Task 2: Extract Neutral Shared UI Reusables

**Files:**
- Create: `src/shared/ui/composite/location-card.tsx`
- Create: `src/shared/ui/composite/age-range-selector.tsx`
- Modify: `src/features/match-create/ui/components/selected-location-card.tsx`
- Modify: `src/features/match-create/ui/components/age-selector.tsx`
- Modify: `src/features/team/ui/components/team-create-step-schedule.tsx`
- Modify: `src/features/team/ui/components/team-create-step-traits.tsx`
- Modify: `src/features/team/ui/components/match/team-match-create-form.tsx`

**Step 1: Add neutral shared components**
- Copy behavior from existing components without changing UI/interaction.
- Use neutral names and props (no `create` semantics).

**Step 2: Keep backward compatibility wrappers**
- Replace match-create component implementations with thin wrappers importing shared components to avoid large blast radius.

**Step 3: Update team feature imports**
- Switch team files to `@/shared/ui/composite/*` imports.

**Step 4: Verify no cross-feature internal import remains**
Run: `rg -n "@/features/match-create/ui/components/(selected-location-card|age-selector)" src/features/team`
Expected: no matches.

---

### Task 3: Move Match Create View Infra Access into Feature API Hooks

**Files:**
- Modify: `src/features/match-create/api/queries.ts`
- Modify: `src/features/match-create/api/mutations.ts`
- Modify: `src/features/match-create/ui/match-create-view.tsx`

**Step 1: Add query hooks for view bootstrap/edit**
- Add `useMatchCreateBootstrap()` to load current user + teams.
- Add `useMatchEditPrefill(matchId)` to load editable match details via feature api path.

**Step 2: Add mutation hook for saving defaults**
- Add `useSaveMatchCreateDefaults()` mutation for account/contact default save side-effects.

**Step 3: Replace view direct service usage**
- Remove direct `getSupabaseBrowserClient`, `createAuthService`, `createTeamService`, `createMatchService` calls from view.
- Consume hooks only.

**Step 4: Verify boundary rule**
Run: `rg -n "getSupabaseBrowserClient|createAuthService|createTeamService|createMatchService" src/features/match-create/ui`
Expected: no matches.

---

### Task 4: DTO-First UI Consumption in Match Create

**Files:**
- Modify: `src/features/match-create/ui/match-create-view.tsx`
- Modify: `src/features/match-create/ui/components/recent-matches-dialog.tsx`
- Modify: `src/features/match-create/ui/components/match-create-operations.tsx`
- Modify: `src/features/match-create/lib/hooks/use-recent-match-prefill.ts`
- Modify: `src/features/match-create/mappers/match-to-prefill-mapper.ts`

**Step 1: Replace DB row types in UI with DTO contracts**
- Remove `database.types` imports from UI files.
- Use feature DTOs from `model/types.ts`.

**Step 2: Adapt recent dialog + prefill pipeline**
- Query hook returns recent match DTOs.
- Dialog consumes DTOs only.
- Prefill hook receives DTO and maps to form state.

**Step 3: Type operations component props with DTO**
- Use DTO types for user/team input instead of DB row types.

**Step 4: Verify no DB-row leakage in UI**
Run: `rg -n "database.types" src/features/match-create/ui`
Expected: no matches.

---

### Task 5: Form Type Safety and Cleanup (No Behavior Change)

**Files:**
- Modify: `src/features/match-create/ui/match-create-view.tsx`
- Modify: `src/features/match-create/model/schema.ts`

**Step 1: Add concrete form type usage**
- Replace `useForm()` with typed form model.
- Replace `onSubmit(data: any)` and local `any` with explicit types.

**Step 2: Keep current manual validation behavior intact**
- Retain existing UX messages and section scroll behavior.

**Step 3: Remove duplicate local constants where possible**
- Reuse shared constants/utils where already available without changing behavior.

---

### Task 6: Final Boundary Validation + Build Verification

**Files:**
- Modify: none

**Step 1: Run boundary checks**
Run:
- `rg -n "@/features/match-create/ui/components/(selected-location-card|age-selector)" src/features/team`
- `rg -n "database.types" src/features/match-create/ui`
- `rg -n "getSupabaseBrowserClient|createAuthService|createTeamService|createMatchService" src/features/match-create/ui`

Expected:
- all return no matches.

**Step 2: Run lint**
Run: `npm run lint`
Expected: pass.

**Step 3: Run build**
Run: `npm run build`
Expected: pass.

