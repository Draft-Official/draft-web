# FSD Phase 2 & 2.5 Migration - Entities 작업 로그

**날짜**: 2026-02-13 ~ 2026-02-14
**브랜치**: refactor/designsystem
**작업**: Phase 2 - Team entities 마이그레이션 / Phase 2.5 - All entities 모델 생성

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

## 🎯 Phase 2.5 완료! (2026-02-14)

**Phase 2.5 - All Entities Model Types Migration: 완료**

### 문제 발견
- entities/match - model/types.ts 없음 ❌
- entities/application - model/types.ts 없음 ❌
- entities/gym - 폴더 자체가 없음 ❌
- entities/user - 폴더 자체가 없음 ❌

### 완료된 작업

#### 1. DB Schema 기반 Entity Types 생성
✅ **entities/match/model/types.ts**
- ClientMatch (DB row → entity)
- CreateMatchInput, UpdateMatchInput
- DB 컬럼 그대로 매핑 (gymId, teamId, hostId만 참조)

✅ **entities/application/model/types.ts**
- ClientApplication (DB row → entity)
- CreateApplicationInput, UpdateApplicationInput
- ApplicationStatusValue, CancelTypeValue import

✅ **entities/gym/model/types.ts** (새로 생성)
- ClientGym (위치 정보의 주인!)
- latitude, longitude는 Gym의 속성
- GymFacilities JSONB type

✅ **entities/user/model/types.ts** (새로 생성)
- ClientUser
- UserMetadata JSONB type
- PositionValue[] 타입

#### 2. CLAUDE.md에 Common Mistakes 추가
✅ **실수 4: Nested props 사용 (React anti-pattern)**
- ❌ 중첩된 객체 구조
- ✅ Flat props (React 공식 권장)

✅ **실수 5: N개의 개별 쿼리 실행 (N+1 문제)**
- ❌ N개의 개별 service 호출
- ✅ JOIN 쿼리 한 번에

#### 3. 빌드 검증
✅ TypeScript 컴파일 성공
✅ 모든 entity types 정상 동작 확인

### 구조 개선 결과

**Before (Phase 2):**
```
entities/
├── team/model/types.ts ✅
├── match/ (model 없음) ❌
└── application/ (model 없음) ❌
```

**After (Phase 2.5):**
```
entities/
├── team/model/types.ts ✅
├── match/model/types.ts ✅
├── application/model/types.ts ✅
├── gym/model/types.ts ✅ (신규)
└── user/model/types.ts ✅ (신규)
```

### 핵심 원칙 확립
1. ✅ **DB Schema First** - 항상 DB 스키마를 먼저 확인
2. ✅ **Entity Independence** - entities는 ID만 참조 (cross-import 금지)
3. ✅ **Flat Props** - React 권장 패턴 따르기
4. ✅ **JOIN Queries** - N+1 문제 방지

---

---

## 🎉 Phase 2 & 2.5 완료!

**Phase 2 - Team Entities Migration: 완료**
- 모든 team API가 `entities/team` service를 사용하도록 마이그레이션 완료
- 중복 API 파일 제거 (1626줄 삭제)
- 빌드 성공 확인
- 커밋: 26071e9

**Phase 2.5 - All Entities Model Types: 완료**
- 모든 entity에 model/types.ts 생성 (Match, Application, Gym, User)
- CLAUDE.md에 Common Mistakes 추가 (Nested props, N+1 queries)
- DB Schema 기반 타입 정의 완료
- 빌드 성공 확인
- Commit: bf6f1b1

---

## 🔍 Phase 2.5 추가 발견사항

### ⚠️ @x Cross-Import 패턴 발견 (FSD 위반!)

**위치:**
- `entities/team/@x/match.ts` ❌
- `entities/match/@x/team.ts` ❌
- `entities/match/@x/application.ts` ❌
- `entities/application/@x/match.ts` ❌

**문제:**
- `@x` 패턴도 entities 간 cross-import!
- FSD 원칙: entities는 완전히 독립적이어야 함
- CLAUDE.md "실수 2"에도 명시되어 있음

**올바른 방법:**
```typescript
// ❌ entities에서 cross-import (@x 패턴)
import { useMatch } from '@/entities/team/@x/match';

// ✅ features에서 각각 import하고 조합
import { useMatch } from '@/entities/match';
import { useTeam } from '@/entities/team';

const match = useMatch(matchId);
const team = useTeam(match.teamId);  // 조합은 features에서!
```

**계획:**
- Phase 3에서 모든 `@x` 폴더 제거
- features/에서 올바르게 entities 조합하도록 수정
- 계획 문서: `docs/plans/2026-02-14-phase3-remove-cross-imports.md`

---

**다음 단계**: Phase 3 - @x Cross-Imports 제거 및 FSD 원칙 완전 준수

**마지막 업데이트**: 2026-02-14 (Phase 2.5 완료, Phase 3 계획 작성)
