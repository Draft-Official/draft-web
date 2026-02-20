# Shared Location Search Component Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract match-create location search (UI + behavior) into one shared composite component and apply it to both match-create and team-create.

**Architecture:** Add `shared/ui/composite/location-search-field` that owns search/dropdown/select behavior via `useLocationSearch`, then sync selected result to parent through callbacks. Replace feature-level duplicated UI blocks with this component while keeping each feature's submit/prefill behavior intact.

**Tech Stack:** Next.js App Router, React 19, TypeScript, react-hook-form, shadcn/ui, Tailwind CSS

---

### Task 1: Add Shared Composite Component

**Files:**
- Create: `src/shared/ui/composite/location-search-field.tsx`

**Step 1: Write the failing test**

- Note: this repository currently has no unit test runner configured in `package.json`.
- Validation strategy for this task: TypeScript/ESLint compile path + manual behavior checks in pages.

**Step 2: Run verification baseline**

Run: `npm run lint`  
Expected: baseline pass before refactor

**Step 3: Write minimal implementation**

- Build `LocationSearchField` with:
  - internal `useLocationSearch` usage
  - dropdown list rendering (match-create behavior)
  - selected `LocationCard` rendering
  - optional external `value` sync
  - `onResolvedChange` callback

**Step 4: Run verification**

Run: `npm run lint`  
Expected: pass

**Step 5: Commit**

```bash
git add src/shared/ui/composite/location-search-field.tsx
git commit -m "feat: add shared location search field composite"
```

### Task 2: Integrate in Match Create

**Files:**
- Modify: `src/features/match-create/ui/components/match-create-basic-info.tsx`
- Modify: `src/features/match-create/ui/match-create-view.tsx`
- Modify: `src/features/match-create/model/use-match-create-view-model.ts`
- Modify: `src/features/match-create/model/hooks/use-prefill-from-recent-match.ts`

**Step 1: Write the failing test**

- No test runner configured; use lint + manual edit/prefill flow as behavioral verification.

**Step 2: Run verification baseline**

Run: `npm run lint`  
Expected: pass

**Step 3: Write minimal implementation**

- Replace location UI in `match-create-basic-info` with `LocationSearchField`.
- Change view-model to keep `locationData`, `isExistingGym`, `gymFacilities` state via callback.
- Update prefill hook to set location selection state directly (instead of calling feature-level location handler).

**Step 4: Run verification**

Run: `npm run lint`  
Expected: pass

**Step 5: Commit**

```bash
git add src/features/match-create/ui/components/match-create-basic-info.tsx \
  src/features/match-create/ui/match-create-view.tsx \
  src/features/match-create/model/use-match-create-view-model.ts \
  src/features/match-create/model/hooks/use-prefill-from-recent-match.ts
git commit -m "refactor: use shared location search in match-create"
```

### Task 3: Integrate in Team Create

**Files:**
- Modify: `src/features/team/ui/components/team-create-step-schedule.tsx`
- Modify: `src/features/team/ui/team-create-form.tsx`

**Step 1: Write the failing test**

- No test runner configured; use lint + manual team create step-2 flow verification.

**Step 2: Run verification baseline**

Run: `npm run lint`  
Expected: pass

**Step 3: Write minimal implementation**

- Remove duplicated location input/dropdown UI.
- Use `LocationSearchField` with match-create-equivalent behavior.
- Keep existing submit logic dependent on `locationData`.

**Step 4: Run verification**

Run: `npm run lint`  
Expected: pass

**Step 5: Commit**

```bash
git add src/features/team/ui/components/team-create-step-schedule.tsx \
  src/features/team/ui/team-create-form.tsx
git commit -m "refactor: unify team-create location search with shared component"
```

### Task 4: Cleanup and Final Verification

**Files:**
- Delete (if unused): `src/features/match-create/ui/components/selected-location-card.tsx`
- Modify docs if needed

**Step 1: Remove dead code**

- Delete helper wrappers that are no longer referenced.

**Step 2: Run full verification**

Run: `npm run lint`  
Expected: pass

**Step 3: Manual smoke checks**

- Match create:
  - type keyword => dropdown appears
  - select item => card appears
  - clear => input mode returns
  - prefill/edit data => selected card populated
- Team create:
  - step 2 location search and selection identical behavior
  - next button enabled only after location selected

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: share location search component across create flows"
```
