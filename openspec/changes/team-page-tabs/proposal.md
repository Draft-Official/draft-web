## Why

`/team` 페이지에 팀 관리 UI가 필요하다. 현재 mock 데이터를 사용하는 `host-dashboard-view.tsx`를 제거하고, 실제 DB와 연동된 2탭 구조(나의 팀 / 팀 생성하기+)로 재구성하여 사용자가 팀을 생성하고, 소속 팀을 확인하며, 미투표 경기에 빠르게 접근할 수 있도록 한다.

## What Changes

### 삭제
- `src/features/team/ui/host-dashboard-view.tsx` 삭제 (mock 데이터 사용, 더 이상 사용 안 함)
- `src/features/team/model/mock-data.ts` 삭제

### 신규 UI
- `/team` 페이지를 2개 탭 구조로 변경:
  - **나의 팀 탭**: 소속 팀 카드 (가로 스크롤) + 미투표 경기 목록
  - **팀 생성하기+ 탭**: 기능 설명 + 팀 생성 버튼 (→ `/team/create`)
- 팀 프로필 카드 컴포넌트 (1:1 비율, 팀 로고/이름/역할/정기운동 정보)
- 미투표 경기 카드 컴포넌트 (투표중 뱃지, 날짜/시간/장소, 투표 현황)
- 팀 없음 Empty State (팀 생성 유도)
- 팀 생성 기능 소개 섹션 (팀원 관리, 정기운동 생성, 초대 링크)

### 기존 유지
- `/team/create` 페이지 및 `TeamCreateForm` (4단계 폼) 그대로 사용
- `team-schema` change에서 구현된 API layer 활용

## Capabilities

### New Capabilities
- `team-page`: /team 페이지의 탭 구조, 팀 카드, 미투표 경기 목록, Empty State, 팀 생성 소개 UI

### Modified Capabilities
<!-- 기존 team-schema의 API를 그대로 사용하므로 spec 수정 없음 -->

## Impact

### 코드 변경
- `src/app/team/page.tsx`: 새로운 탭 구조 컴포넌트로 교체
- `src/features/team/ui/`: 새 컴포넌트 추가
  - `team-page-tabs.tsx` (메인 탭 컨테이너)
  - `my-teams-tab.tsx` (나의 팀 탭)
  - `team-create-tab.tsx` (팀 생성하기+ 탭)
  - `team-profile-card.tsx` (팀 카드)
  - `pending-vote-match-card.tsx` (미투표 경기 카드)
  - `team-empty-state.tsx` (팀 없음 상태)
  - `team-create-benefits.tsx` (팀 생성 기능 소개)

### API 의존성
- `useMyTeams(userId)`: 내 소속 팀 목록 조회 (team-schema에서 구현됨)
- `useTeamMatches(teamId)`: 팀 경기 목록 조회 (team-schema에서 구현됨)
- 투표 현황 조회 API 필요 여부 확인 필요

### UI 라이브러리
- shadcn/ui: `Tabs`, `Card`, `Badge`, `Button`, `ScrollArea`
- lucide-react: 아이콘
