# Design: Match List Card UI 개선

## Context

매치 리스트 페이지(`/`)는 게스트 사용자가 참여 가능한 매치를 탐색하는 핵심 화면입니다. 현재 구현에는 다음과 같은 UX 이슈가 있습니다:

**현재 상태:**
- Sticky Header: 날짜별 그룹 헤더가 스크롤 시 고정되어 공간을 차지
- 신청 상태 미표시: 사용자가 이미 신청한 매치인지 리스트에서 확인 불가
- 포지션 ANY 매핑 이슈: DB의 `ANY` 값이 "포지션 무관"으로 표시되지 않는 케이스 존재
- 마감 필터 부재: 마감된 경기를 가릴 수 있는 옵션 없음
- 전체 로딩: 모든 매치를 한 번에 로드하여 대량 데이터 시 성능 이슈

**기술 스택:**
- Next.js 15 App Router
- React Query (TanStack Query)
- Supabase PostgreSQL
- shadcn/ui 컴포넌트

## Goals / Non-Goals

**Goals:**
- 카드 내 날짜 표시로 Sticky Header 제거
- 사용자 신청 상태를 카드에서 직접 확인 가능
- "더 보기" 버튼 방식 페이지네이션으로 성능 개선
- NEW 뱃지로 새 매치 식별 용이
- 마감 가리기 필터 추가

**Non-Goals:**
- 카드 디자인 전면 리뉴얼 (기존 스타일 유지)
- 무한 스크롤 구현 (더 보기 버튼으로 결정)
- 검색 기능 추가 (별도 change에서 다룸)

## Decisions

### 1. 날짜 표시 방식

**결정:** Sticky Header 제거, 카드 상단에 날짜+시간 통합 표시

**Before:**
```
[Sticky Header: 1월 28일 (화)]
┌─────────────────────────────────────┐
│ 19:00 ~ 21:00 [5:5] [남성]   10,000원│
│ ...                                  │
└─────────────────────────────────────┘
```

**After:**
```
┌─────────────────────────────────────┐
│ 1월 28일 (화) 19:00 ~ 21:00   10,000원│
│ [NEW] (1시간 이내 생성 시)           │
│ ...                                  │
└─────────────────────────────────────┘
```

**근거:**
- 카드 단위로 모든 정보 제공 (스크롤 위치와 무관)
- Sticky 레이어 줄여 UI 단순화
- 날짜별 그룹핑은 유지하되 시각적 구분선만 표시

### 2. 카드 구조 변경

**결정:** 성별/게임 방식 chip을 하단 포지션 영역으로 이동

**새 구조:**
```
┌─────────────────────────────────────────────┐
│ 1월 28일 (화) 19:00 ~ 21:00 [NEW]    10,000원│
│ 강남구민회관 · 📍 서울 강남구                │
│ [🏀/팀로고] 팀이름                          │
│ [포지션 무관] [남성] [5:5]      [신청하기]   │
│                             또는 [승인대기]  │
└─────────────────────────────────────────────┘
```

**포지션 Chip 매핑:**
```typescript
// positions.all이 있으면 "포지션 무관" 표시
// positions.all이 없으면 G/F/C 각각 표시
// DB의 position_type이 ANY인 경우 positions.all로 매핑
```

**팀 정보 표시:**
```typescript
// team_id가 있으면: 팀로고 + 팀이름
// team_id가 없으면 (개인 주최): 🏀 + manual_team_name
```

### 3. 신청 상태 표시

**결정:** 신청하기 버튼 위치에 상태별 Badge 표시

**데이터 흐름:**
```
1. 페이지 로드 시 useUserApplications() 호출
2. 현재 로그인 사용자의 활성 신청 목록 조회
3. matchId로 신청 상태 lookup
4. 카드에 상태 Badge 또는 신청하기 버튼 렌더링
```

**상태별 Badge:**
```typescript
const APPLICATION_STATUS_BADGE: Record<string, { label: string; variant: string }> = {
  PENDING: { label: '승인대기', variant: 'warning' },      // yellow
  PAYMENT_PENDING: { label: '입금대기', variant: 'info' }, // blue
  CONFIRMED: { label: '참여확정', variant: 'success' },    // green
};
```

**컴포넌트 로직:**
```typescript
// match-list-item.tsx
const userApplicationStatus = applicationStatusMap?.get(match.id);

return (
  <div className="flex shrink-0 ml-2">
    {match.isClosed ? (
      <Badge variant="secondary">모집 마감</Badge>
    ) : userApplicationStatus ? (
      <Badge variant={getVariant(userApplicationStatus)}>
        {APPLICATION_STATUS_LABELS[userApplicationStatus]}
      </Badge>
    ) : (
      <Button>신청하기</Button>
    )}
  </div>
);
```

### 4. NEW 뱃지 로직

**결정:** 매치 생성 후 1시간 이내인 경우 날짜 옆에 표시

**구현:**
```typescript
const isNew = (createdAt: string): boolean => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= 1;
};

// 카드 렌더링
<span className="text-[15px] font-bold">
  {formatDate(match.dateISO)} {match.startTime} ~ {match.endTime}
</span>
{isNew(match.createdAt) && (
  <Badge variant="destructive" className="ml-2 text-[10px]">NEW</Badge>
)}
```

### 5. 페이지네이션 구현

**결정:** "더 보기" 버튼 + React Query useInfiniteQuery

**API 설계:**
```typescript
// Supabase query
const PAGE_SIZE = 20;

const fetchMatches = async ({ pageParam = 0 }) => {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .gte('date', todayISO())
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })
    .range(pageParam, pageParam + PAGE_SIZE - 1);

  return {
    matches: data,
    nextCursor: data?.length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined,
  };
};
```

**React Query 설정:**
```typescript
// queries.ts
export function useRecruitingMatchesInfinite(filters: MatchFilters) {
  return useInfiniteQuery({
    queryKey: matchKeys.listInfinite(filters),
    queryFn: ({ pageParam }) => fetchMatches({ pageParam, filters }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}
```

**UI 구현:**
```typescript
// page.tsx
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useRecruitingMatchesInfinite(filters);

const matches = data?.pages.flatMap(page => page.matches) ?? [];

return (
  <>
    {matches.map(match => <MatchListItem key={match.id} match={match} />)}

    {hasNextPage && (
      <div className="flex justify-center py-6">
        <Button
          variant="outline"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? (
            <Spinner className="mr-2" />
          ) : null}
          더 보기
        </Button>
      </div>
    )}
  </>
);
```

### 6. 마감 가리기 필터

**결정:** 상세 필터 모달에 토글 추가

**FilterBar 변경:**
```typescript
interface FilterBarProps {
  // 기존 props...
  hideClosed?: boolean;
  onHideClosedChange?: (hide: boolean) => void;
}
```

**DetailedFilterModal 변경:**
```typescript
// 마감 가리기 토글 추가
<div className="flex items-center justify-between py-3">
  <Label>마감된 경기 가리기</Label>
  <Switch
    checked={hideClosed}
    onCheckedChange={onHideClosedChange}
  />
</div>
```

**필터 로직:**
```typescript
// utils.ts filterMatches 함수에 추가
if (filters.hideClosed) {
  result = result.filter(match => !match.isClosed);
}
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         page.tsx                            │
│  ┌──────────────────┐  ┌────────────────────────────────┐   │
│  │ FilterBar        │  │ useRecruitingMatchesInfinite() │   │
│  │ - 필터 상태 관리 │  │ - 페이지네이션 매치 조회       │   │
│  └────────┬─────────┘  └───────────────┬────────────────┘   │
│           │                             │                    │
│           └──────────┬──────────────────┘                    │
│                      ▼                                       │
│           ┌────────────────────┐                             │
│           │ useUserApplications│ (로그인 시)                 │
│           │ - 사용자 신청 상태 │                             │
│           └────────┬───────────┘                             │
│                    ▼                                         │
│           ┌────────────────────┐                             │
│           │ MatchListItem      │                             │
│           │ - 카드 렌더링      │                             │
│           │ - 신청 상태 Badge  │                             │
│           └────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| 신청 상태 추가 쿼리 | N+1 문제 가능 | 한 번에 모든 신청 조회 후 Map으로 lookup |
| 페이지네이션 UX | 특정 매치 찾기 어려움 | 필터 기능 강화, 추후 검색 추가 고려 |
| NEW 뱃지 시간 기준 | 서버/클라이언트 시간 차이 | 서버 시간 기준 계산, UTC 사용 |
| 날짜 그룹 제거 | 날짜 구분 약해짐 | 날짜 변경 시 구분선 유지 (optional) |

## Migration Plan

### Phase 1: 카드 UI 변경
1. match-list-item.tsx 구조 변경
2. 날짜+시간 통합 표시
3. 성별/게임 방식 chip 위치 이동
4. 포지션 ANY → "포지션 무관" 매핑 수정

### Phase 2: Sticky Header 제거
1. page.tsx에서 날짜별 sticky header 제거
2. 날짜 변경 시 얇은 구분선만 유지 (선택적)

### Phase 3: 신청 상태 표시
1. useUserApplications 쿼리 추가
2. MatchListItem에 applicationStatus prop 추가
3. Badge 컴포넌트 추가 (shadcn)
4. 상태별 Badge 렌더링 로직 구현

### Phase 4: 페이지네이션
1. useRecruitingMatchesInfinite 쿼리 추가
2. page.tsx 무한 쿼리로 변경
3. "더 보기" 버튼 UI 추가

### Phase 5: 필터 및 기타
1. 마감 가리기 필터 추가
2. NEW 뱃지 로직 추가
3. 오늘 이전 매치 필터링 (쿼리 레벨)

**Rollback:** Phase별 독립 배포로 문제 시 해당 Phase만 롤백

## Open Questions

1. ~~날짜 그룹 구분선 유지 여부~~ → 제거 (카드에 날짜 표시로 충분)
2. ~~NEW 뱃지 지속 시간~~ → 1시간으로 결정
3. 비로그인 사용자 신청 상태 → 신청하기 버튼만 표시 (로그인 유도)
