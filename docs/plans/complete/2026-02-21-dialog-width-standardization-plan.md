# Dialog Width Standardization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Standardize dialog/modal widths with shared `DialogContent` size tokens and remove per-screen hardcoded `max-w` values.

**Architecture:** Introduce width variants in `src/shared/ui/shadcn/dialog.tsx` and migrate feature-level `DialogContent` usages to `size` props. Keep behavior unchanged except width class centralization.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS 4, shadcn/ui

---

### Task 1: Add shared width tokens to DialogContent

**Files:**
- Modify: `src/shared/ui/shadcn/dialog.tsx`

Steps:
1. Add `cva` variants for dialog width sizes.
2. Add `size` prop typing to `DialogContent`.
3. Keep default close button behavior intact.

### Task 2: Migrate feature dialogs to `size` prop

**Files:**
- Modify all feature files using hardcoded `max-w-*` in `DialogContent`.

Steps:
1. Replace `max-w-*`, `w-[90%]`, and width `calc(...)` classes with `size`.
2. Preserve non-width styling classes (`rounded-*`, `p-*`, `max-h-*`, overflow).
3. Keep custom primitive dialog (`region-filter-modal`) as explicit exception.

### Task 3: Verify and summarize

**Steps:**
1. Run `npm run lint`.
2. Re-scan `DialogContent` width usages with `rg` to confirm migration.
3. Report remaining intentional exceptions.
