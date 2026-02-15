# Schedule Feature DTO Refactoring Design

## Goal
Refactor `features/schedule` to use Flat DTOs with strict FSD boundaries, following the same pattern used in match DTO refactoring.

- Keep behavior 100% identical
- Use incremental migration
- Separate DB/Entity concerns from UI DTO concerns

## Scope
- `features/schedule` only
- Include all schedule paths:
  - guest / team / tournament
  - participating / managing

## Architecture Principles (Strict FSD)
1. `model/types.ts` defines DTO contracts for schedule UI.
2. `lib/mappers.ts` performs Entity -> DTO only.
3. `api/queries.ts` returns DTOs only.
4. `ui/*` consumes DTOs only (no DB-row shape assumptions).
5. DB rows are converted through entity mappers before DTO mapping.
6. Legacy schedule view-model types are removed at cleanup phase.

## Naming Convention
Use explicit names aligned with existing match DTO style:
- `matchType`: `guest | team | tournament`
- `scheduleMode`: `participating | managing`
- `status`: existing schedule status domain values

Avoid ambiguous top-level `type` for schedule DTO contracts.

## Data Flow
1. Query DB in `features/schedule/api/queries.ts`
2. Map DB row -> Entity (`entities/*` mappers)
3. Map Entity -> DTO (`features/schedule/lib/mappers.ts`)
4. Return DTO from hooks
5. Render DTO in UI

## DTO Set Design
### 1) List DTOs
- Base:
  - `BaseScheduleMatchListItemDTO`
- Specialized unions:
  - `GuestParticipatingMatchListItemDTO`
  - `TeamParticipatingMatchListItemDTO`
  - `TournamentParticipatingMatchListItemDTO`
  - `GuestManagingMatchListItemDTO`
  - `TeamManagingMatchListItemDTO`
  - `TournamentManagingMatchListItemDTO`
- Aggregate union:
  - `ScheduleMatchListItemDTO`

### 2) Detail DTOs
- `HostMatchDetailDTO`
- `TeamExerciseManageDetailDTO`
- `TournamentManageDetailDTO`
- Applicant-related:
  - `MatchApplicantDTO`
  - `MatchApplicantCompanionDTO`
  - `MatchApplicantHistoryDTO`

## Incremental Migration Plan (Same as Match Pattern)
### Phase 1 Foundation
- Add schedule DTO types
- Add/adjust mapper functions to return DTOs
- Keep legacy types as deprecated temporarily

### Phase 2 Query Migration
- Convert hook return types to DTO:
  - `useHostedMatches`
  - `useParticipatingMatches`
  - `useHostMatchDetail`
  - `useMatchApplicants`

### Phase 3 List UI Migration
- Update list path components to DTO props:
  - `match-management-view`
  - `match-card`
  - `application-info-dialog`

### Phase 4 Host Detail UI Migration
- Update host detail path to DTO props:
  - `host-match-detail-view`
  - `guest-list-section`
  - `recruitment-status-section`
  - `edit-quota-dialog`
  - `guest-profile-dialog`
  - `match-cancel-dialog`

### Phase 5 Team/Tournament Path Migration
- Migrate team/tournament detail/manage views to DTO contracts
- Keep mode split explicit via `scheduleMode`

### Phase 6 Cleanup
- Remove legacy schedule view-model types
- Remove compatibility aliases and dead mappers
- Finalize public API exports around DTO contracts only

## Verification
1. Static checks
- No UI component depends on DB row shape
- Schedule hooks return DTO types only

2. Build/quality gate
- `npm run build` passes

3. Regression checks (manual smoke)
- Match management list (participating/managing)
- Host detail applicant flows (approve/reject/confirm/cancel)
- Team/tournament schedule views

4. Cleanup checks
- No legacy schedule types referenced in `features/schedule`

## Risks & Mitigation
1. Mixed-mode unions may increase type complexity
- Use discriminated unions with `matchType` + `scheduleMode`

2. Existing UI implicit assumptions on optional fields
- Keep temporary compatibility fields during incremental phases
- Remove only after usage is fully migrated

3. Behavior drift during mapper rewrite
- Keep status mapping and sorting/filter logic unchanged
- Compare outputs for key scenarios before cleanup

## Expected Outcome
- Schedule feature follows the same DTO pipeline as match
- Clear Entity vs DTO boundaries
- UI typing is explicit, stable, and easier to evolve
- Strict FSD layering consistency across features
