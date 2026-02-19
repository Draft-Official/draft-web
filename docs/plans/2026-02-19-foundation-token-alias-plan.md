# Foundation Token Alias Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stabilize Seed-based Foundation token aliasing (`draft -> carrot`) and apply it safely to existing shadcn UI.

**Architecture:** Keep `foundation.css` as token source of truth, keep `shadcn-bridge.css` as semantic mapping layer, and progressively migrate hardcoded colors in feature code to semantic tokens.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS 4, shadcn/ui

---

### Task 1: Verify Foundation Entry Wiring

**Files:**
- Verify: `app/globals.css`
- Verify: `src/shared/ui/theme/foundation.css`
- Verify: `src/shared/ui/theme/shadcn-bridge.css`

**Step 1: Verify import order**

Run: `rg -n "@import \"shadcn/tailwind.css\"|foundation.css|shadcn-bridge.css" app/globals.css`
Expected: `shadcn/tailwind.css` remains imported and foundation/bridge imports are present.

**Step 2: Build check**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add app/globals.css src/shared/ui/theme/foundation.css src/shared/ui/theme/shadcn-bridge.css
git commit -m "style: add foundation token layer and shadcn bridge"
```

### Task 2: Replace Hardcoded Brand Colors (Phase 2a)

**Files:**
- Modify: `src/features/**/ui/**/*.tsx`
- Modify: `src/shared/ui/composite/**/*.tsx`

**Step 1: Find hardcoded brand usage**

Run: `rg -n "#FF6600|orange-|text-\\[#FF6600\\]|bg-\\[#FF6600\\]" src`
Expected: List of files needing migration.

**Step 2: Replace with semantic tokens**

Examples:
- `text-[#FF6600]` -> `text-primary`
- `bg-[#FF6600]` -> `bg-primary`
- `hover:bg-[#FF6600]/90` -> `hover:bg-primary/90`
- `bg-orange-50` -> `bg-[var(--color-bg-brand-weak)]` (or project utility alias)

**Step 3: Verify locally**

Run: `npm run build`
Expected: Build succeeds.

### Task 3: Introduce Tokenized Utility Aliases (Optional but recommended)

**Files:**
- Modify: `app/globals.css`

**Step 1: Add utility aliases**

Add utility classes for tokenized usage, such as:
- `.bg-brand-weak { background-color: var(--color-bg-brand-weak); }`
- `.text-brand { color: var(--color-fg-brand); }`
- `.border-brand-weak { border-color: var(--color-stroke-brand-weak); }`

**Step 2: Replace raw CSS var usage in JSX**

Run: `rg -n "var\\(--color-" src`
Expected: minimize ad-hoc inline var usage and prefer utility aliases.

### Task 4: Verification Gate

**Files:**
- N/A

**Step 1: Architecture checks**

Run: `npm run check:architecture`
Expected: all checks pass.

**Step 2: Build check**

Run: `npm run build`
Expected: build passes.

**Step 3: Lint status**

Run: `npm run lint`
Expected: currently may fail due to ESLint environment issue unrelated to this feature; capture exact output.

### Task 5: Document Validation Results

**Files:**
- Modify: `docs/migration/phase-1-verification.md` (or create phase-2 verification doc)

**Step 1: Record what passed/failed with command output summary**

Include:
- build result
- architecture checks result
- lint environment blocker

**Step 2: Commit**

```bash
git add docs/migration/phase-1-verification.md
git commit -m "docs: add foundation token alias verification results"
```

