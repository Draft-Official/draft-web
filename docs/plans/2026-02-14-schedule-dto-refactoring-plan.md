# Schedule Feature DTO Refactoring Implementation Plan

> Goal: Refactor `features/schedule` to Flat DTO flow with strict FSD boundaries, matching the `features/match` migration pattern.

## Success Criteria
- `features/schedule/api/queries.ts` returns DTO types only.
- `features/schedule/ui/*` consumes DTO contracts only.
- DB shape assumptions are isolated to API/entity mapping layer.
- Legacy schedule view-model types are removed or marked deprecated until cleanup.
- `npm run build` passes without regression.

## Naming Rules (Locked)
- `matchType`: `guest | host | team | tournament`
- `scheduleMode`: `participating | managing`
- `status`: existing schedule status domain values
- Avoid ambiguous top-level `type` in schedule DTO contracts.

## Phase 1. Foundation (Types + DTO Mappers)
1. Add DTO contracts to `src/features/schedule/model/types.ts`
- `ScheduleMatchListItemDTO`
- `HostMatchDetailDTO`
- `MatchApplicantDTO`
- `MatchApplicantCompanionDTO`
- `MatchApplicantHistoryDTO`
- Keep current legacy types with `@deprecated` for temporary compatibility.

2. Align mapper outputs in `src/features/schedule/lib/mappers.ts`
- `matchToManagedMatch` -> return `ScheduleMatchListItemDTO`
- `matchToHostMatchDetail` -> return `HostMatchDetailDTO`
- `applicationToGuest` -> return `MatchApplicantDTO`
- Do not change runtime behavior.

## Phase 2. Query Migration (Hook Return Types)
1. Update `src/features/schedule/api/queries.ts`
- `useHostedMatches`: `Promise<ScheduleMatchListItemDTO[]>`
- `useParticipatingMatches`: `Promise<ScheduleMatchListItemDTO[]>`
- `useHostMatchDetail`: `Promise<HostMatchDetailDTO | null>`
- `useMatchApplicants`: `Promise<MatchApplicantDTO[]>`

2. Keep existing sorting/status logic unchanged.
3. Keep mutation invalidation keys unchanged.

## Phase 3. List UI Migration
1. Update list consumers to DTO names only
- `src/features/schedule/ui/match-management-view.tsx`
- `src/features/schedule/ui/components/match-card.tsx`
- `src/features/schedule/ui/components/application-info-dialog.tsx`

2. Remove direct dependency on deprecated legacy type names in list path.

## Phase 4. Host Detail UI Migration
1. Update detail path components to DTO contracts
- `src/features/schedule/ui/detail/host-match-detail-view.tsx`
- `src/features/schedule/ui/detail/guest-list-section.tsx`
- `src/features/schedule/ui/detail/recruitment-status-section.tsx`
- `src/features/schedule/ui/detail/edit-quota-dialog.tsx`

2. Keep action/mutation behavior exactly the same.

## Phase 5. Team/Tournament Path Alignment
1. Align team/tournament detail/manage types with same DTO policy.
2. Keep mock-data path functional while API migration is incremental.

## Phase 6. Cleanup
1. Remove deprecated legacy schedule view-model types.
2. Remove compatibility aliases and dead mapper branches.
3. Tighten exports in `src/features/schedule/index.ts` to DTO-first API.

## Verification Checklist (Per Phase)
1. Type Check
- No new `any`.
- No UI file reading DB row shape directly.

2. Build
- `npm run build` passes.

3. Regression Smoke
- Schedule list (guest/host) filter/sort/status behavior unchanged.
- Host detail applicant actions (approve/reject/confirm/cancel) unchanged.

## Initial Execution Order (Sub-agent style in this session)
1. Phase 1 (types/mappers) -> build
2. Phase 2 (queries) -> build
3. Phase 3-4 (UI type conversion) -> build
4. Phase 5-6 (alignment/cleanup) -> final build
