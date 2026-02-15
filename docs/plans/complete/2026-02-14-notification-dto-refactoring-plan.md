# Notification Feature DTO Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor `features/notification` to entity->DTO flow without behavior changes.

**Architecture:** Add `entities/notification` for row mapping/service, map to feature DTOs in `features/notification/lib/mappers.ts`, and make notification UI consume DTO fields only.

**Tech Stack:** TypeScript, React Query, Next.js App Router, Supabase, FSD

---

## Locked Constraints
1. Notification click/read logic must remain identical.
2. Query keys and invalidation behavior must remain unchanged.
3. Schedule unread grouping behavior must remain unchanged.
4. Commit at phase boundaries.

## Phase 1. Foundation
1. Add `entities/notification` (types/mapper/service/index).
2. Add feature DTO contracts in `src/features/notification/model/types.ts`.
3. Add entity->DTO mappers in `src/features/notification/lib/mappers.ts`.
4. Export DTO/mappers in `src/features/notification/index.ts`.
5. Verify: `npm run build`.

## Phase 2. Query/Mutation Migration
1. Update `src/features/notification/api/queries.ts` to:
- use `createNotificationService` from entities
- map `row -> entity -> dto`
- keep announcement message enrichment behavior
2. Update `src/features/notification/api/mutations.ts` to use entity service.
3. Align schedule notification type usage in:
- `src/features/schedule/ui/match-management-view.tsx`
- `src/features/schedule/ui/components/match-card.tsx`
4. Verify: `npm run build`.

## Phase 3. UI DTO Migration + Cleanup
1. Update `src/features/notification/ui/notification-item.tsx` to consume DTO-render fields.
2. Remove legacy feature-level notification service/row-mapper files.
3. Tighten exports in `src/features/notification/index.ts`.
4. Verify: `npm run lint && npm run build`.

## Regression Checklist
1. Bell unread count updates unchanged.
2. Notification list text/time/icon output unchanged.
3. Notification click navigation unchanged.
4. Schedule unread badge remains unchanged.
