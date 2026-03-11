# Optimistic Updates UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply user-friendly optimistic updates for create/vote/remove/delete flows with safe rollback.

**Architecture:** Add `onMutate`-based optimistic cache patching to high-impact mutations and centralize vote-summary math in pure helper functions covered by tests. Keep existing server invalidation flow so optimistic state is always reconciled.

**Tech Stack:** Next.js, TypeScript, TanStack Query v5, Node test runner (`node:test`).

---

### Task 1: Add Vote Optimistic Helper Tests (RED)

**Files:**
- Create: `src/features/team/api/match/optimistic-vote-helpers.test.ts`
- Create: `src/features/schedule/api/optimistic-vote-helpers.test.ts`

1. Write failing tests for vote bucket transitions and summary delta behavior.
2. Run tests and confirm they fail because helper implementation is missing.

### Task 2: Implement Vote Optimistic Helpers (GREEN)

**Files:**
- Create: `src/features/team/api/match/optimistic-vote-helpers.ts`
- Create: `src/features/schedule/api/optimistic-vote-helpers.ts`

1. Implement minimal pure functions to patch vote status and summary counts.
2. Re-run tests until all pass.

### Task 3: Apply Optimistic Vote UX in Mutations

**Files:**
- Modify: `src/features/team/api/match/mutations.ts`
- Modify: `src/features/schedule/api/vote-mutations.ts`

1. Add `onMutate` snapshots/cancel/optimistic patching.
2. Add `onError` rollback using snapshots.
3. Preserve success invalidation for eventual consistency.

### Task 4: Apply Optimistic Create/Remove/Delete UX

**Files:**
- Modify: `src/features/team/api/membership/mutations.ts`
- Modify: `src/features/team/api/team-info/mutations.ts`

1. Add optimistic pending membership for `useJoinTeam`.
2. Add optimistic removal for `useRemoveMember`, `useLeaveTeam`, `useDeleteTeam`.
3. Add rollback paths for all affected caches.

### Task 5: Verification

**Files:**
- N/A

1. Run targeted tests for new helpers.
2. Run `npm run lint`.
3. Confirm no TypeScript or lint errors introduced by optimistic paths.

