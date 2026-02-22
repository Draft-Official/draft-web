# Match Short ID Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Introduce `matches.short_id` as public identifier and migrate public match URLs to `/m/{short_id}` while keeping UUID as internal PK.

**Architecture:** Apply DB-first migration (`short_id` + unique/default/backfill), then propagate identifier split through entity/DTO mappers and route/navigation updates. Keep all write paths UUID-based; read paths accept UUID or `short_id`.

**Tech Stack:** Next.js App Router, TypeScript, Supabase, PostgreSQL

---

### Task 1: Database migration for `matches.short_id`

**Files:**
- Create: `supabase/migrations/20260222_add_matches_short_id.sql`

Steps:
1. Add pgcrypto extension guard.
2. Add `gen_match_short_id()` function (base62, length 10).
3. Add nullable `matches.short_id`.
4. Backfill existing rows.
5. Add unique index + format check + default + NOT NULL.

### Task 2: Type/domain propagation

**Files:**
- Modify: `src/shared/types/database.types.ts`
- Modify: `src/entities/match/model/types.ts`
- Modify: `src/entities/match/api/mapper.ts`
- Modify: `src/entities/match/api/match-service.ts`

Steps:
1. Add `short_id` to DB generated types section.
2. Add `shortId` to match entity.
3. Map DB row `short_id` -> entity `shortId`.
4. Update detail read service to resolve by UUID or `short_id`.

### Task 3: Feature DTO split (internal id vs public id)

**Files:**
- Modify: `src/features/match/model/types.ts`
- Modify: `src/features/match/lib/mappers.ts`
- Modify: `src/features/schedule/model/types.ts`
- Modify: `src/features/schedule/lib/mappers.ts`
- Modify: `src/features/schedule/api/queries.ts`

Steps:
1. Add `publicId` field to match/schedule DTOs.
2. Set `publicId = short_id ?? id` in mappers.
3. Ensure participating query selects `short_id`.
4. Keep UUID-only fields for mutation/internal queries.

### Task 4: Canonical routing and legacy redirects

**Files:**
- Create: `app/(main)/m/[identifier]/page.tsx`
- Create: `app/(main)/m/[identifier]/manage/page.tsx`
- Create: `src/pages/m/[identifier]/page.tsx`
- Create: `src/pages/m/[identifier]/manage/page.tsx`
- Modify: `app/(main)/matches/[id]/page.tsx`
- Modify: `app/(main)/matches/[id]/manage/page.tsx`
- Create: `src/shared/server/match/resolve-match-public-id.ts`

Steps:
1. Add new canonical `/m` routes.
2. Add shared server resolver from UUID -> `short_id`.
3. Replace legacy `/matches` pages with `permanentRedirect` wrappers.

### Task 5: Navigation updates

**Files:**
- Modify: `src/pages/matches/[id]/page.tsx`
- Modify: `src/pages/matches/[id]/manage/page.tsx`
- Modify: `src/features/match/ui/match-list-item.tsx`
- Modify: `src/features/match/ui/components/detail/share-modal.tsx`
- Modify: `src/features/match/ui/match-detail-view.tsx`
- Modify: `src/features/schedule/ui/match-management-view.tsx`
- Modify: `src/features/schedule/ui/detail/host-match-detail-view.tsx`
- Modify: `src/features/notification/lib/mappers.ts`
- Modify: `src/features/match-create/model/hooks/use-match-create-submit.ts`
- Modify: `src/features/match-create/model/use-match-create-view-model.ts`

Steps:
1. Move public links to `/m/{publicId}`.
2. Keep edit/manage mutation inputs UUID.
3. In host manage UI, resolve route identifier -> internal UUID before mutation calls.

### Task 6: Verification

Steps:
1. Run `npx tsc --noEmit`.
2. Run `npm run lint`.
3. Grep for leftover legacy public links and verify intentional ones only.
