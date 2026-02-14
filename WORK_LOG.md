# FSD Phase 2 Migration - Team API 작업 로그

**날짜**: 2026-02-13
**브랜치**: refactor/designsystem
**작업**: Phase 2 - Team entities 마이그레이션

---

## ✅ 완료된 작업

### 1. entities/team 강화
- ✅ `entities/team/api/team-service.ts`에 `getMyPendingVoteMatches()` 메서드 추가
- ✅ TeamService 클래스에 모든 team CRUD, membership, match, fees 로직 통합 완료

### 2. Queries 마이그레이션 (100% 완료)
모든 queries.ts 파일이 `createTeamService` 사용하도록 수정 완료:
- ✅ `src/features/team/api/core/queries.ts`
- ✅ `src/features/team/api/fees/queries.ts`
- ✅ `src/features/team/api/match/queries.ts`
- ✅ `src/features/team/api/membership/queries.ts`

### 3. Mutations 일부 마이그레이션
- ✅ `src/features/team/api/core/mutations.ts` - 완료 (service 메서드 호출로 변경됨)
- ✅ `src/features/team/api/fees/mutations.ts` - 완료

### 4. 중복 API 파일 삭제
- ✅ `src/features/team/api/core/api.ts` 삭제
- ✅ `src/features/team/api/match/api.ts` 삭제
- ✅ `src/features/team/api/membership/api.ts` 삭제
- ✅ `src/features/team/api/fees/` 폴더 전체 삭제 (사용 안 함)

### 5. Index 파일 정리
- ✅ 삭제된 파일들의 export 제거 완료
- ✅ `src/features/team/api/index.ts` - fees export 제거

---

## ✅ 추가 완료 작업 (2026-02-14)

### 빌드 에러 목록

**현재 빌드 실패 원인 3가지:**

#### 1. match-create-view.tsx 잘못된 import
```bash
# 파일 위치
src/features/match-create/ui/match-create-view.tsx

# 현재 (30번 라인)
import { createTeamService } from '@/features/team/api';

# 수정 필요
import { createTeamService } from '@/entities/team';
```

**수정 명령어:**
```bash
sed -i '' "s|from '@/features/team/api'|from '@/entities/team'|g" src/features/match-create/ui/match-create-view.tsx
```

---

#### 2. match/mutations.ts - 함수 직접 호출 (service 미사용)
```bash
# 파일 위치
src/features/team/api/match/mutations.ts
```

**문제**: import는 수정되었으나, 여전히 존재하지 않는 함수들을 직접 호출 시도
- `createTeamMatch(supabase, ...)`
- `upsertTeamVote(supabase, ...)`
- `closeVoting(supabase, ...)`
- `reopenVoting(supabase, ...)`
- `updateMemberVote(supabase, ...)`
- `updateTeamMatch(supabase, ...)`
- `cancelTeamMatch(supabase, ...)`

**수정 방법**: 모든 함수 호출을 service 메서드 호출로 변경
```typescript
// 현재 패턴 (잘못됨)
return createTeamMatch(supabase, hostId, input);

// 수정 필요
const service = createTeamService(supabase);
return service.createTeamMatch(hostId, input);
```

**필요한 수정**:
- Line 38: `createTeamMatch()` → `service.createTeamMatch()`
- Line 66: `upsertTeamVote()` → `service.upsertTeamVote()`
- Line 101: `closeVoting()` → `service.closeVoting()`
- Line 163: `reopenVoting()` → `service.reopenVoting()`
- Line 195: `updateMemberVote()` → `service.updateMemberVote()`
- Line 233: `updateTeamMatch()` → `service.updateTeamMatch()`
- Line 261: `cancelTeamMatch()` → `service.cancelTeamMatch()`

---

#### 3. membership/mutations.ts - 함수 직접 호출
```bash
# 파일 위치
src/features/team/api/membership/mutations.ts
```

**문제**: import는 수정되었으나, 여전히 존재하지 않는 함수들을 직접 호출
- `createJoinRequest(supabase, ...)`
- `approveJoinRequest(supabase, ...)`
- `rejectJoinRequest(supabase, ...)`
- `updateMemberRole(supabase, ...)`
- `removeMember(supabase, ...)`
- `leaveTeam(supabase, ...)`
- `transferLeadership(supabase, ...)`
- `createVotesForNewMember(supabase, ...)`

**수정 방법**: 모든 함수 호출을 service 메서드 호출로 변경

---

## 🔧 수정 스크립트 (한 번에 실행)

```bash
#!/bin/bash

# 1. match-create-view.tsx import 수정
sed -i '' "s|from '@/features/team/api'|from '@/entities/team'|g" \
  src/features/match-create/ui/match-create-view.tsx

# 2. team-settings-view.tsx import 수정 (이미 했을 수도 있음)
sed -i '' "s|from '@/features/team/api/core/api'|from '@/entities/team'|g" \
  src/features/team/ui/components/detail/team-settings-view.tsx
sed -i '' "s|from '@/features/team/api/membership/api'|from '@/entities/team'|g" \
  src/features/team/ui/components/detail/team-settings-view.tsx

echo "Import paths fixed!"
echo ""
echo "⚠️  Still need manual fix:"
echo "  - src/features/team/api/match/mutations.ts (all function calls)"
echo "  - src/features/team/api/membership/mutations.ts (all function calls)"
```

---

## 📊 진행 상황

**Phase 2 - Team Migration: 100% 완료 ✅**

- ✅ Queries 마이그레이션: 100%
- ✅ Mutations 마이그레이션: 100%
- ✅ 중복 파일 제거: 100%
- ✅ UI 파일 import 수정: 100%
- ✅ 빌드 성공 확인: 100%

---

## 🎯 완료된 작업 (2026-02-14)

1. ✅ Import 경로 수정
   - `match-create-view.tsx`: `@/features/team/api` → `@/entities/team`
   - `team-settings-view.tsx`: 함수 import를 service 사용으로 변경

2. ✅ `match/mutations.ts` 수정 완료
   - 7개 mutation 모두 service 메서드 호출로 변경
   - 타입 import 추가 (CreateTeamMatchInput, VoteInput)

3. ✅ `membership/mutations.ts` 수정 완료
   - 8개 mutation 모두 service 메서드 호출로 변경
   - 타입 import 추가 (ClientTeamMember)

4. ✅ 빌드 성공 확인
   - `npm run build` 실행 → 성공
   - 모든 TypeScript 타입 에러 해결

5. ✅ 커밋 완료
   - Commit: 26071e9
   - 21 files changed, 413 insertions(+), 1626 deletions(-)

---

## 📝 참고: Service 메서드 목록

**TeamService에서 사용 가능한 메서드들:**

```typescript
// Core
getTeam(teamId)
getTeamByCode(code)
checkTeamCodeExists(code)
createTeam(userId, input)
updateTeam(teamId, input)
deleteTeam(teamId)
getMyTeams(userId)

// Membership
getTeamMembers(teamId)
getPendingMembers(teamId)
getMembership(teamId, userId)
createJoinRequest(teamId, userId)
approveJoinRequest(membershipId)
rejectJoinRequest(membershipId)
updateMemberRole(membershipId, role)
removeMember(membershipId)
leaveTeam(teamId, userId)
transferLeadership(teamId, currentLeaderId, newLeaderId)
getTeamMemberCount(teamId)

// Match & Voting
createTeamMatch(hostId, input)
createVotesForNewMember(teamId, userId)
getTeamMatches(teamId, options?)
getTeamMatch(matchId)
upsertTeamVote(userId, input)
getMyVote(matchId, userId)
getTeamVotes(matchId)
getVotingSummary(matchId, teamId)
closeVoting(matchId)
reopenVoting(matchId)
updateMemberVote(matchId, memberId, status, description?)
updateTeamMatch(matchId, input)
cancelTeamMatch(matchId)
openGuestRecruitment(matchId, recruitmentSetup)
getMyPendingVoteMatches(teamIds, userId, options?)

// Fees
getTeamFees(teamId, yearMonth)
getMyFeeStatus(teamId, userId, yearMonth)
updateFeeStatus(updatedBy, input)
getFeeSummary(teamId, yearMonth)
initializeMonthlyFees(teamId, yearMonth)
```

---

---

## 🎉 Phase 2 완료!

**Phase 2 - Team Entities Migration: 완료**
- 모든 team API가 `entities/team` service를 사용하도록 마이그레이션 완료
- 중복 API 파일 제거 (1626줄 삭제)
- 빌드 성공 확인
- 커밋: 26071e9

**다음 단계**: Phase 3 - Match Entities Migration 또는 Seed Design 통합

**마지막 업데이트**: 2026-02-14 (Phase 2 완료)
