## Why

팀 상세 페이지의 일정 탭에서 매치 목록은 표시되지만, 실제로 **팀 매치를 생성하거나 상세 보기/투표**하는 기능이 없다. FAB에서 "경기 생성하기" 버튼이 `/team/${code}/match/create`로 이동하지만 해당 페이지가 없고, 일정 탭에서 매치 클릭 시 `/team/${code}/matches/${matchId}`로 이동하지만 역시 페이지가 없다.

팀 정기운동의 핵심 플로우인 **생성 → 상세 확인 → 투표 → 마감**을 완성해야 팀 시스템이 실제로 사용 가능해진다.

## Current State (현재 상태)

### 구현 완료
- **팀 생성** (`/team/create`) - 3단계 스텝 폼
- **팀 탭/목록** (`/team`) - 나의 팀 목록, 미투표 경기 표시
- **팀 상세** (`/team/[code]`) - 홈/일정/멤버 3탭
- **팀 초대 링크** - FAB에서 클립보드 복사
- **팀원 관리** - 가입 승인/거절, 역할 관리
- **팀 설정** - 프로필 수정, 계좌, 소유자 위임, 삭제

### API만 있고 UI 없음
- `team-match-api.ts` - createTeamMatch, getTeamMatches, closeVoting
- `team-match-mutations.ts` - useCreateTeamMatch, useVote, useCloseVoting
- `vote-dialog.tsx` - 투표 다이얼로그 UI (연동 안됨)

### 미구현
- `/team/[code]/match/create` - 팀 매치 생성 페이지
- `/team/[code]/matches/[matchId]` - 팀 매치 상세 페이지
- 투표 UI 연동 (상세 페이지에서 다이얼로그 호출)
- 투표 마감 기능 (관리자 전용 버튼)
- 비팀원 가입 플로우 (팀 상세 접근 시 가입 버튼)

## What Changes

### 신규 페이지

#### 1. 팀 매치 생성 페이지 (`/team/[code]/match/create`)
- 팀 정보 기반 자동 입력 (정기운동 요일/시간, 홈구장)
- 필수 입력: 날짜, 시작 시간, 종료 시간, 장소
- 선택 입력: 메모/공지
- 생성 시 팀원 전체에게 application 레코드 생성 (PENDING 상태)

#### 2. 팀 매치 상세 페이지 (`/team/[code]/matches/[matchId]`)
- 매치 정보 표시 (날짜, 시간, 장소)
- 투표 현황 표시 (참석/불참/늦참/미응답 카운트)
- 투표자 목록 (아바타, 닉네임, 투표 상태)
- 내 투표 상태 + 투표 버튼 → VoteDialog 연동
- 관리자 전용: 투표 마감 버튼

### UI 컴포넌트

#### 신규
- `team-match-create-form.tsx` - 팀 매치 생성 폼
- `team-match-detail-view.tsx` - 팀 매치 상세 뷰
- `voting-status-card.tsx` - 투표 현황 카드
- `voter-list.tsx` - 투표자 목록

#### 수정
- `team-fab.tsx` - 경기 생성 시 권한 체크 추가 (Leader/Manager만)
- `team-schedule-tab.tsx` - 매치 카드에 투표 상태 표시

### 팀 가입 플로우 (비팀원)

현재 팀 상세 페이지는 멤버십 체크 없이 모든 정보를 보여준다. 비팀원이 접근할 때:
- 팀 기본 정보 (이름, 소개, 지역)만 표시
- [팀 가입 신청] 버튼 노출
- 가입 신청 시 PENDING 상태로 team_members 생성
- 팀장에게 알림 발송

## Capabilities

### New Capabilities
- `team-match-create`: 팀 매치 생성 페이지 및 폼
- `team-match-detail`: 팀 매치 상세, 투표 현황, 투표 연동
- `team-join-flow`: 비팀원 가입 신청 플로우

### Modified Capabilities
- `team-detail`: 비팀원 접근 시 제한된 뷰 + 가입 버튼

## Impact

### 코드 변경
- `src/app/team/[code]/match/create/page.tsx` - 신규
- `src/app/team/[code]/matches/[matchId]/page.tsx` - 신규
- `src/features/team/ui/components/match/` - 신규 디렉토리
  - `team-match-create-form.tsx`
  - `team-match-detail-view.tsx`
  - `voting-status-card.tsx`
  - `voter-list.tsx`
- `src/features/team/ui/components/detail/team-detail-header.tsx` - 비팀원 가입 버튼 추가
- `src/features/team/ui/team-detail-view.tsx` - 비팀원 접근 분기 처리

### API 사용 (기존)
- `useCreateTeamMatch` - 팀 매치 생성
- `useVotingStatus` - 투표 현황 조회
- `useVote` - 투표 제출
- `useCloseVoting` - 투표 마감 (관리자)
- `useJoinTeam` - 팀 가입 신청

### API 추가 필요
- `useTeamMatch` - 단일 팀 매치 상세 조회 (query)
- `useReopenVoting` - 투표 마감 취소/재오픈 (mutation)
- `useUpdateTeamMatch` - 팀 매치 수정 (시간, 장소)
- `useCancelTeamMatch` - 팀 매치 취소
- `useUpdateMemberVote` - 팀장이 팀원 투표를 대신 변경 (마감 후에도 가능)

### DB 쿼리
- `matches` 테이블 조회 (team_id 기준)
- `applications` 테이블 조회 (match_id + source='TEAM_VOTE')
- `team_members` 생성 (가입 신청)

## Scope Exclusions (제외)

- **게스트 모집 전환**: 팀 매치에서 인원 부족 시 게스트 모집 전환 기능 - 별도 proposal
- **회비 관리**: 팀 회비 납부 체크 기능 - 구현 안 함
- **팀 공지사항**: 팀 내 공지 작성/조회 - 별도 검토
- **출석 통계**: 팀원별 참석률 표시 - 별도 검토

## Edge Cases & Exception Handling (예외 케이스)

### 1. 투표 변경

| 케이스 | 현재 상태 | 필요 처리 |
|--------|----------|----------|
| 마감 전 투표 변경 | ✅ API 지원 | UI에서 변경 버튼 노출 |
| 마감 후 투표 변경 | ✅ API에서 차단 | UI에서도 버튼 비활성화 + 안내 메시지 |
| 투표 취소 (미응답으로 되돌리기) | ❌ 미지원 | **결정 필요**: 허용할지 여부 |

### 2. 투표 마감 관리

| 케이스 | 현재 상태 | 필요 처리 |
|--------|----------|----------|
| 투표 마감 | ✅ API 존재 | UI 버튼 추가 |
| 투표 마감 취소 (재오픈) | ❌ 미구현 | **결정 필요**: 마감 후 재오픈 허용? |
| 마감 시 미응답자 처리 | ❓ 정의 안됨 | **결정 필요**: 미응답 = 불참 자동 처리? or 그대로 유지? |
| 자동 마감 (경기 시작 N시간 전) | ❌ 미구현 | MVP에서 수동 마감만 지원, 자동 마감은 Phase 2+ |

### 3. 팀원 변동 (투표 진행 중)

| 케이스 | 현재 상태 | 필요 처리 |
|--------|----------|----------|
| 새 멤버 가입 승인 | ✅ `createVotesForNewMember` | 가입 승인 시 자동 호출 연동 필요 |
| 멤버 탈퇴 | ❓ 투표 기록 유지? 삭제? | **결정 필요**: 탈퇴 시 application 처리 방법 |
| 멤버 강퇴 | ❓ 동일 | 탈퇴와 동일 처리 |
| 역할 변경 (Manager → Member) | ✅ 투표 권한 동일 | 마감 권한만 변경됨 (UI 처리) |

### 4. 매치 관리

| 케이스 | 현재 상태 | 필요 처리 |
|--------|----------|----------|
| 매치 수정 (시간, 장소) | ❌ API 미구현 | 수정 페이지/API 필요 |
| 매치 취소 | ❌ API 미구현 | 취소 API + 팀원 알림 |
| 매치 삭제 | ❌ API 미구현 | 삭제 API (관련 application도 삭제) |
| 지난 매치 표시 | ✅ 일정 탭에서 opacity 처리 | 투표 불가 표시 추가 |

### 5. 권한 체계

| 액션 | Leader | Manager | Member |
|------|--------|---------|--------|
| 매치 생성 | ✅ | ✅ | ❌ |
| 매치 수정 | ✅ | ✅ | ❌ |
| 매치 취소/삭제 | ✅ | ❓ | ❌ |
| 투표 마감 | ✅ | ✅ | ❌ |
| 마감 취소 (재오픈) | ✅ | ❓ | ❌ |
| 투표 참여 | ✅ | ✅ | ✅ |

### 6. 데이터 정합성

| 케이스 | 현재 상태 | 필요 처리 |
|--------|----------|----------|
| 중복 투표 방지 | ✅ unique(match_id, user_id, source) | - |
| 동시성 (같은 시점 투표 변경) | ❓ 마지막 쓰기 우선 | optimistic update + conflict 처리 |
| 팀원 수 vs 투표 수 불일치 | ❓ 가능 (가입/탈퇴 시점 차이) | summary에서 application 기준으로 계산 (현재 로직 OK) |

### 7. UI 상태

| 케이스 | 필요 처리 |
|--------|----------|
| 투표 로딩 중 | 버튼 비활성화 + 스피너 |
| 투표 실패 | toast 에러 + 재시도 가능 |
| 낙관적 업데이트 | 즉시 UI 반영 → 실패 시 롤백 |
| 오프라인 상태 | 투표 버튼 비활성화 or 큐잉 (MVP: 비활성화) |

---

## Decisions (결정 사항)

| 항목 | 결정 | 구현 |
|------|------|------|
| **투표 취소** | 불허 | 한번 투표하면 변경만 가능 (참석↔불참↔늦참). 미응답으로 되돌리기 불가 |
| **투표 마감 재오픈** | 허용 | Leader만 마감 취소(재오픈) 가능. `reopenVoting` API 추가 필요 |
| **미응답자 처리** | 그대로 유지 | 마감해도 미응답자는 PENDING 상태 유지. UI에서 "미응답" 표시 |
| **탈퇴 시 투표 기록** | 유지 | 탈퇴해도 application 기록 보존 (통계용). user 정보만 null 가능 |
| **마감 후 변경** | 팀장 대신 변경 | 마감 상태에서도 Leader/Manager가 팀원 투표를 대신 변경 가능. `useUpdateMemberVote` API 필요 |

---

## Implementation Priority

1. **팀 매치 생성 페이지** - FAB 연동 완성
2. **팀 매치 상세 페이지** - 투표 기능 연동
3. **투표 마감 기능** - 관리자 권한
4. **비팀원 가입 플로우** - 팀 상세 접근 분기
5. **매치 수정/취소** - 관리 기능
6. **예외 케이스 처리** - edge case UI 대응
