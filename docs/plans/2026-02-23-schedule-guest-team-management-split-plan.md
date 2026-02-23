# Schedule Guest/Team Management Split Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split `경기관리` into two explicit domains (`게스트 모집`, `팀운동`) so each has its own card behavior, badge system, and management page.

**Architecture:** Keep shared layout primitives (`MatchCardLayout`) but separate domain logic at DTO, routing, and card-render layers. Introduce explicit schedule domain type for management (`guest_recruitment` vs `team_exercise`) instead of overloading one `matchType`/`host` abstraction. Use dedicated management routes: guest recruitment stays under `/matches/[id]/manage`, team exercise moves to a team-scoped manage route.

**Tech Stack:** Next.js (pages router), TypeScript, React Query, Supabase

---

### Confirmed UX Wording (2026-02-23)

- 팀운동 카드/상세 CTA는 `투표하기`, `투표변경`을 사용한다.
- `응답하기`, `응답 변경` 용어는 사용하지 않는다.
- `투표현황 모달`(이름 Chip 형태)은 전체 팀원에게 공개한다.

---

### Task 1: Split schedule domain type (guest recruitment vs team exercise)

**Files:**
- Modify: `src/features/schedule/model/types.ts`
- Modify: `src/features/schedule/config/constants.ts`

Steps:
1. Add a new domain field for list items (example: `managementType: 'guest_recruitment' | 'team_exercise' | 'tournament'`).
2. Keep legacy `matchType` temporarily for compatibility, but stop using it for domain decisions.
3. Split badge/status constants by domain (guest recruitment statuses vs team exercise vote statuses).

### Task 2: Fix hosted/participating query mapping to emit correct domain type

**Files:**
- Modify: `src/features/schedule/api/queries.ts`
- Modify: `src/features/schedule/lib/mappers.ts`

Steps:
1. In hosted queries, map `row.match_type === 'TEAM_MATCH'` to `team_exercise` (currently everything becomes `host`).
2. Keep guest-recruit matches mapped to `guest_recruitment`.
3. Continue attaching team vote summary only for `team_exercise`.
4. Ensure returned DTO has enough route context (`teamCode`, public id) for team manage navigation.

### Task 3: Separate list card components and badge logic by domain

**Files:**
- Modify: `src/features/schedule/ui/components/match-card.tsx`
- Create: `src/features/schedule/ui/components/guest-recruitment-card.tsx`
- Create: `src/features/schedule/ui/components/team-exercise-card.tsx`
- Modify: `src/shared/ui/composite/match-card-layout.tsx` (only if additional slots are needed)

Steps:
1. Replace monolithic switch-based card with domain-specific card components.
2. Guest recruitment card: keep applicant/payment actions and guest-oriented status badge.
3. Team exercise card: show vote summary, vote badge (`미투표`, `투표마감`, etc.), and team-oriented CTA.
4. Keep only shared visual skeleton in `MatchCardLayout`.

### Task 4: Create separate management routes

**Files:**
- Modify: `src/pages/matches/[id]/manage/page.tsx`
- Create: `src/pages/team/[code]/matches/[matchId]/manage/page.tsx`
- Modify: `src/features/schedule/ui/match-management-view.tsx`

Steps:
1. Make `/matches/[id]/manage` guest-recruitment-only host management page.
2. Add `/team/[code]/matches/[matchId]/manage` as team exercise management page.
3. In schedule list navigation, route:
   - host + `guest_recruitment` -> `/matches/${publicId}/manage`
   - host + `team_exercise` -> `/team/${teamCode}/matches/${publicId}/manage`
   - participating + `team_exercise` -> existing team detail page
4. Remove current fake `type` branching in manage page and branch using real DB-backed match type.

### Task 5: Define and implement Team Exercise Manage scope

**Files:**
- Modify: `src/features/schedule/ui/detail/team-exercise-manage-view.tsx`
- Modify: `src/features/team/api/match/queries.ts`
- Modify: `src/features/team/api/match/mutations.ts`
- Modify: `src/features/team/ui/components/match/team-match-detail-view.tsx` (if shared sections are extracted)

Steps:
1. Replace mock-driven team manage data with real query data.
2. Include these management sections:
   - 기본 정보 (일시/장소/상태)
   - 투표 현황 (참석/지각/미정/불참/미투표)
   - 멤버별 투표/참여 명단
   - 공지/운영 메모
   - 전체 팀원 공개 `투표현황 모달` (이름 Chip 빠른 조회)
3. Include manager actions:
   - 투표 마감/재오픈
   - 일정/장소 수정
   - 팀운동 취소
   - 필요 시 게스트 모집 전환
4. Enforce role-based permissions (LEADER/MANAGER only for manage actions).
   - 단, `투표현황 모달` 열람은 MEMBER 포함 전체 팀원 허용
5. 팀운동 CTA 라벨은 상태별로 고정:
   - 미투표: `투표하기`
   - 투표 완료: `투표변경`
   - 투표 마감: `투표마감`

### Task 6: Stabilize legacy entry points and deep links

**Files:**
- Modify: `src/pages/matches/[id]/page.tsx`
- Modify: `src/features/notification/lib/mappers.ts`

Steps:
1. Replace legacy fake `type` checks with actual `matchType` values from DTO.
2. If team exercise URL enters `/matches/[id]/manage`, redirect to team manage route when team code is available.
3. Keep notification target paths consistent with the new split routes.

### Task 7: Tests for split behavior and regression safety

**Files:**
- Create: `src/features/schedule/lib/__tests__/mappers.test.ts`
- Create: `src/features/schedule/ui/components/__tests__/match-card-routing.test.tsx`
- Create: `src/pages/team/[code]/matches/[matchId]/manage/__tests__/access.test.tsx` (or nearest existing test location)

Steps:
1. Add mapper tests to verify DB `match_type -> managementType` mapping.
2. Add card tests to verify badge rendering differs between guest recruitment and team exercise.
3. Add navigation tests for host/participating route differences.
4. Add permission tests for team manage route.

### Task 8: Verification and rollout checks

Steps:
1. Run `npm run lint`.
2. Run `npx tsc --noEmit`.
3. Run targeted tests for schedule/team match modules.
4. Manual QA matrix:
   - host list: guest recruitment card/badge and team exercise card/badge both visible
   - host click: each opens its dedicated manage page
   - participating list: team exercise remains vote/detail flow
   - notifications/deep links open correct route
