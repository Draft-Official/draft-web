## Context

현재 `/team` 페이지는 mock 데이터를 사용하는 `host-dashboard-view.tsx`를 렌더링한다. 이를 실제 DB와 연동된 2탭 구조로 재구성한다.

**기존 인프라:**
- `useMyTeams(userId)` - 내 소속 팀 목록 (team-schema에서 구현됨)
- `useTeamMatches(teamId)` - 팀 경기 목록 (team-schema에서 구현됨)
- `/team/create` 페이지 및 `TeamCreateForm` - 4단계 폼 (구현 완료)

**사용 가능한 UI 컴포넌트:**
- `@/shared/ui/base`: Tabs, Card, Badge, Button, Avatar, ScrollArea, Alert
- `@/shared/ui/shadcn`: Accordion, Alert, Separator

## Goals / Non-Goals

**Goals:**
- `/team` 페이지를 2탭 구조(나의 팀 / 팀 생성하기+)로 구현
- shadcn/ui 컴포넌트를 최대한 활용하여 새 컴포넌트 최소화
- 기존 team-schema API와 연동

**Non-Goals:**
- 팀 상세 페이지 (`/team/[code]`) - 다음 change에서 구현
- 팀 설정/수정 기능 - 팀 프로필 페이지에서 구현 예정
- 투표 기능 자체 - 이미 team-schema에서 정의됨

## Decisions

### 1. 컴포넌트 구조: 3파일로 최소화

```
src/features/team/ui/
├── team-page-tabs.tsx      # 메인 탭 컨테이너
├── my-teams-tab.tsx        # 나의 팀 탭 (팀 카드 + 미투표 경기)
└── team-create-tab.tsx     # 팀 생성하기+ 탭 (기능 소개 + 버튼)
```

**결정**: 별도 컴포넌트 파일 없이 각 탭 파일 내에서 Card, Badge 등 조합
- ❌ `team-profile-card.tsx` → Card 직접 사용
- ❌ `team-empty-state.tsx` → Alert/Card 직접 사용
- ❌ `pending-vote-match-card.tsx` → Card 직접 사용
- ❌ `team-create-benefits.tsx` → 직접 마크업

**이유**: shadcn 컴포넌트가 이미 충분히 유연함. 재사용 필요 없는 UI는 분리 불필요.

### 2. 나의 팀 탭 레이아웃

```
┌─────────────────────────────┐
│ [팀카드1] [팀카드2] ...     │ ← 가로 스크롤 (ScrollArea)
├─────────────────────────────┤
│ 미투표 경기                  │
│ ┌─────────────────────────┐ │
│ │ 투표중 | 2026.02.07 ... │ │ ← Card
│ │ 참석 7명 불참 2명 미투표 3명│ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**팀 카드 (1:1 비율):**
- 팀 로고 아이콘 (첫 글자 또는 선택한 아이콘)
- 팀 이름
- 역할 (Leader/Manager/Member)
- 정기운동 정보 (요일, 시간)

**팀 없음 상태:**
- Alert 컴포넌트 사용
- "소속 팀이 없습니다" + "팀 생성하기+" 탭 유도 문구

### 3. 팀 생성하기+ 탭 레이아웃

```
┌─────────────────────────────┐
│ 팀을 만들면 이런 기능을 써요  │
├─────────────────────────────┤
│ 👥 팀원 관리                 │
│ 팀원들의 정기운동 참석과 ...  │
├─────────────────────────────┤
│ 📅 정기운동 생성              │
│ 주간 운동을 자동으로 ...      │
├─────────────────────────────┤
│ 🔗 초대 링크 공유             │
│ 카카오톡으로 초대 링크를 ...  │
├─────────────────────────────┤
│ [       팀 만들기 버튼      ] │
└─────────────────────────────┘
```

**결정**: Accordion 대신 Card 리스트 사용
- 각 기능을 Card로 표시 (아이콘 + 제목 + 설명)
- 하단에 Primary 버튼 → `/team/create` 이동

### 4. API 연동

```typescript
// my-teams-tab.tsx
const { user } = useAuth();
const { data: teams, isLoading } = useMyTeams(user?.id);

// 미투표 경기는 모든 팀의 VOTING 상태 경기 조회 필요
// → useTeamMatches를 각 팀에 대해 호출하거나
// → 새로운 useMyPendingVoteMatches 쿼리 추가
```

**결정**: `useMyPendingVoteMatches(userId)` 쿼리 추가
- 내 소속 팀들의 투표중인 경기를 한 번에 조회
- team-schema의 match API 확장

## Risks / Trade-offs

### 다수 팀 소속 시 성능
- **Risk**: 5개+ 팀 소속 시 미투표 경기 쿼리 다수 발생
- **Mitigation**: `useMyPendingVoteMatches`로 단일 쿼리화

### Empty State UX
- **Risk**: 첫 방문 사용자가 "나의 팀" 탭에서 빈 화면만 보게 됨
- **Mitigation**: 명확한 CTA로 "팀 생성하기+" 탭 유도

## File Changes

### 삭제
- `src/features/team/ui/host-dashboard-view.tsx`
- `src/features/team/model/mock-data.ts`

### 수정
- `src/app/team/page.tsx` → `TeamPageTabs` 렌더링
- `src/features/team/ui/index.ts` → export 수정

### 생성
- `src/features/team/ui/team-page-tabs.tsx`
- `src/features/team/ui/my-teams-tab.tsx`
- `src/features/team/ui/team-create-tab.tsx`
- `src/features/team/api/core/queries.ts` → `useMyPendingVoteMatches` 추가
