# Search Copy SEO Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Clean up outdated public SEO wording and prevent legal pages from influencing search snippets.

**Architecture:** Keep homepage SEO metadata as-is, update only indexed public copy that still uses outdated terminology, and move legal pages to `noindex` while keeping them crawlable. Add a lightweight source-level regression test because the project does not currently have broader automated coverage for SEO metadata rules.

**Tech Stack:** Next.js App Router, TypeScript, Node built-in test runner

---

### Task 1: Add SEO Regression Test

**Files:**
- Create: `test/seo-copy.test.mjs`
- Modify: `package.json`

**Step 1: Write the failing test**

Create a Node test that:
- scans indexed-copy source files for banned phrases like `농구 용병 모집 플랫폼`
- verifies `app/(main)/my/terms/page.tsx` and `app/(main)/my/privacy/page.tsx` export `index: false`
- verifies `app/sitemap.ts` does not list `terms` or `privacy`

**Step 2: Run test to verify it fails**

Run: `npm run test:seo-copy`

Expected: FAIL because the terms page and FAQ still contain banned phrases and the legal pages are still indexable.

**Step 3: Write minimal implementation**

Add the test script entry in `package.json` and keep the assertions narrow to indexed/search-facing sources only.

**Step 4: Run test to verify it passes**

Run: `npm run test:seo-copy`

Expected: PASS

### Task 2: Update Search-Facing Copy

**Files:**
- Modify: `src/features/my/ui/terms-page-view.tsx`
- Modify: `src/features/my/ui/faq-list.tsx`
- Modify: `public/terms-of-service.md`

**Step 1: Update the terms copy**

Replace search-facing `용병` wording with `게스트 모집` terminology while keeping the legal meaning intact.

**Step 2: Update FAQ wording**

Rewrite the service description line so indexed FAQ copy matches homepage terminology.

**Step 3: Keep the public markdown copy aligned**

Mirror the legal wording updates in `public/terms-of-service.md` so any directly linked static copy stays consistent.

### Task 3: Move Legal Pages to Noindex

**Files:**
- Modify: `app/metadata-config.ts`
- Modify: `app/(main)/my/terms/page.tsx`
- Modify: `app/(main)/my/privacy/page.tsx`
- Modify: `app/sitemap.ts`

**Step 1: Add a reusable noindex metadata helper**

Create a helper parallel to indexed metadata so legal pages can share consistent title, description, canonical, and social metadata while exporting `index: false`.

**Step 2: Apply noindex metadata to legal pages**

Switch the terms and privacy pages to the new helper.

**Step 3: Remove legal pages from sitemap**

Keep only pages intended for indexing in `app/sitemap.ts`.

### Task 4: Verify and Prepare Reindexing Guidance

**Files:**
- None

**Step 1: Run regression test**

Run: `npm run test:seo-copy`

Expected: PASS

**Step 2: Run project verification**

Run: `npm run lint`

Expected: same baseline warnings only, no new errors

**Step 3: Run build verification**

Run: `npm run build`

Expected: successful Next.js production build

**Step 4: Summarize Search Console steps**

Document that the homepage should be live-tested and reindexed after deployment, while noindexed legal pages should only be checked for crawl visibility and `noindex` detection.
