# Layout Width Globalization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace hardcoded `760px/430px/240px` layout widths with global tokens/utilities while preserving current UI behavior.

**Architecture:** Define layout width tokens and reusable utility classes in `app/globals.css`, then migrate runtime shell and page/feature containers to those utilities. Unify overlay sidebar offset behavior to `lg` breakpoint to match sidebar visibility.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, global CSS utilities

---

### Task 1: Add global layout tokens and utility classes

**Files:**
- Modify: `app/globals.css`

**Step 1: Write failing verification command**

Run:
```bash
rg -n "--layout-content-max|app-content-container|app-overlay-shell" app/globals.css
```
Expected: no matches

**Step 2: Add minimal implementation**

Add `:root` tokens and `@layer utilities` classes:
- `--layout-content-max`, `--layout-mobile-max`, `--layout-sidebar-width`
- `.app-content-container`, `.app-mobile-container`
- `.app-overlay-shell`, `.app-overlay-shell--with-sidebar`, `.app-overlay-content`

**Step 3: Verify implementation exists**

Run:
```bash
rg -n "--layout-content-max|app-content-container|app-overlay-shell" app/globals.css
```
Expected: matches found

**Step 4: Commit**

```bash
git add app/globals.css
git commit -m "style: add global layout width tokens and utilities"
```

### Task 2: Migrate app runtime shell to global utilities

**Files:**
- Modify: `src/app/layout-shell.tsx`

**Step 1: Write failing verification command**

Run:
```bash
rg -n "max-w-\[760px\]|max-w-\[430px\]|lg:ml-\[240px\]" src/app/layout-shell.tsx
```
Expected: matches found

**Step 2: Write minimal implementation**

Replace hardcoded classes with global utilities / tokenized values:
- signup verify main: `app-mobile-container`
- main content: `app-content-container lg:ml-[var(--layout-sidebar-width)]`

**Step 3: Verify hardcoded values removed from shell**

Run:
```bash
rg -n "max-w-\[760px\]|max-w-\[430px\]|lg:ml-\[240px\]" src/app/layout-shell.tsx
```
Expected: no matches

**Step 4: Commit**

```bash
git add src/app/layout-shell.tsx
git commit -m "refactor: apply global layout width in layout shell"
```

### Task 3: Migrate page and feature content containers

**Files:**
- Modify: `src/pages/home/page.tsx`
- Modify: `src/features/match/ui/match-detail-view.tsx`
- Modify: `src/features/team/ui/components/match/team-match-detail-view.tsx`
- Modify: `src/features/match-create/ui/match-create-view.tsx`
- Modify: `src/features/schedule/ui/detail/host-match-detail-view.tsx`
- Modify: `src/features/schedule/ui/detail/team-exercise-detail-view.tsx`
- Modify: `src/features/schedule/ui/detail/tournament-detail-view.tsx`
- Modify: `src/features/schedule/ui/detail/team-exercise-manage-view.tsx`
- Modify: `src/features/schedule/ui/detail/tournament-manage-view.tsx`

**Step 1: Write failing verification command**

Run:
```bash
rg -n "max-w-\[760px\]" src/pages/home/page.tsx src/features/match/ui/match-detail-view.tsx src/features/team/ui/components/match/team-match-detail-view.tsx src/features/match-create/ui/match-create-view.tsx src/features/schedule/ui/detail/host-match-detail-view.tsx src/features/schedule/ui/detail/team-exercise-detail-view.tsx src/features/schedule/ui/detail/tournament-detail-view.tsx src/features/schedule/ui/detail/team-exercise-manage-view.tsx src/features/schedule/ui/detail/tournament-manage-view.tsx
```
Expected: matches found

**Step 2: Write minimal implementation**

Replace `max-w-[760px]` (and paired `mx-auto`) with `app-content-container` while preserving all non-width classes.

**Step 3: Verify targeted hardcoded values removed**

Run the same command from Step 1.
Expected: no matches

**Step 4: Commit**

```bash
git add src/pages/home/page.tsx src/features/match/ui/match-detail-view.tsx src/features/team/ui/components/match/team-match-detail-view.tsx src/features/match-create/ui/match-create-view.tsx src/features/schedule/ui/detail/host-match-detail-view.tsx src/features/schedule/ui/detail/team-exercise-detail-view.tsx src/features/schedule/ui/detail/tournament-detail-view.tsx src/features/schedule/ui/detail/team-exercise-manage-view.tsx src/features/schedule/ui/detail/tournament-manage-view.tsx
git commit -m "refactor: migrate content containers to global layout utility"
```

### Task 4: Migrate fixed/sticky overlays and align sidebar offset breakpoint

**Files:**
- Modify: `src/features/match/ui/components/detail/bottom-bar.tsx`
- Modify: `src/features/schedule/ui/detail/match-action-button.tsx`
- Modify: `src/features/team/ui/components/match/team-match-detail-view.tsx`
- Modify: `src/features/schedule/ui/detail/team-exercise-detail-view.tsx`
- Modify: `src/features/schedule/ui/detail/tournament-detail-view.tsx`
- Modify: `src/features/schedule/ui/detail/team-exercise-manage-view.tsx`
- Modify: `src/features/schedule/ui/detail/tournament-manage-view.tsx`
- Modify: `src/features/match/ui/recruit-fab.tsx`

**Step 1: Write failing verification command**

Run:
```bash
rg -n "max-w-\[760px\]|md:pl-\[240px\]|md:left-\[240px\]" src/features/match/ui/components/detail/bottom-bar.tsx src/features/schedule/ui/detail/match-action-button.tsx src/features/team/ui/components/match/team-match-detail-view.tsx src/features/schedule/ui/detail/team-exercise-detail-view.tsx src/features/schedule/ui/detail/tournament-detail-view.tsx src/features/schedule/ui/detail/team-exercise-manage-view.tsx src/features/schedule/ui/detail/tournament-manage-view.tsx src/features/match/ui/recruit-fab.tsx
```
Expected: matches found

**Step 2: Write minimal implementation**

Replace overlay wrappers:
- shell wrapper: `app-overlay-shell app-overlay-shell--with-sidebar`
- content wrapper: `app-overlay-content ...`

Convert `md:*240` offset usages to the unified `lg`-based overlay utility.

**Step 3: Verify targeted patterns removed**

Run the same command from Step 1.
Expected: no matches

**Step 4: Commit**

```bash
git add src/features/match/ui/components/detail/bottom-bar.tsx src/features/schedule/ui/detail/match-action-button.tsx src/features/team/ui/components/match/team-match-detail-view.tsx src/features/schedule/ui/detail/team-exercise-detail-view.tsx src/features/schedule/ui/detail/tournament-detail-view.tsx src/features/schedule/ui/detail/team-exercise-manage-view.tsx src/features/schedule/ui/detail/tournament-manage-view.tsx src/features/match/ui/recruit-fab.tsx
git commit -m "refactor: unify overlay width and sidebar offset rules"
```

### Task 5: Validate architecture and build

**Files:**
- No source edits required

**Step 1: Run architecture boundary checks**

Run:
```bash
npm run check:architecture
```
Expected: all checks pass

**Step 2: Run production build**

Run:
```bash
npm run build
```
Expected: build succeeds

**Step 3: Final hardcoding scan**

Run:
```bash
rg -n "max-w-\[760px\]|max-w-\[430px\]|md:pl-\[240px\]|md:left-\[240px\]" src app
```
Expected: only intentional exceptions remain (if any)

**Step 4: Commit verification note (optional)**

```bash
git status --short
```
Expected: clean working tree

