# Tasks: Match List Card UI 개선

## Phase 1: 카드 UI 구조 변경

### 1.1 MatchListItem 컴포넌트 구조 변경
- [x] 1.1.1 날짜+시간 통합 표시 영역 추가
  - [x] `formatDate` 유틸 함수 생성 (`1월 28일 (화)` 형식)
  - [x] 상단에 `{날짜} {시작시간} ~ {종료시간}` 표시
  - [x] 시간 옆의 게임 방식(5:5) chip, 성별 chip 제거
- [x] 1.1.2 하단 영역 재구성
  - [x] 포지션 chips 옆에 성별 chip 추가
  - [x] 포지션 chips 옆에 게임 방식 chip 추가
  - [x] 신청하기 버튼 영역 유지 (Phase 3에서 Badge 로직 추가)
- [x] 1.1.3 체육관/주소 표시 유지
  - [x] 현재 구조 그대로 유지: `{체육관 이름} · 📍 {주소}`

### 1.2 포지션 매핑 수정
- [x] 1.2.1 `ANY` → "포지션 무관" 매핑 확인
  - [x] `match-list-item.tsx`의 PositionChip 로직 확인
  - [x] `positions.all`이 있을 때 "포지션 무관" 표시 확인
  - [x] DB에서 `position_type = 'ANY'`인 경우 `positions.all`로 매핑되는지 확인
- [x] 1.2.2 page.tsx의 adaptMatch 함수 수정
  - [x] ANY 포지션 처리 로직 추가

### 1.3 팀 정보 표시 로직 확인
- [x] 1.3.1 개인 주최 시 🏀 + manual_team_name 표시
  - [x] `isPersonalHost` 또는 `team_id === null` 조건 확인
  - [x] `manual_team_name` 필드가 없을 경우 fallback 처리

## Phase 2: Sticky Header 제거

### 2.1 page.tsx 날짜별 그룹 헤더 제거
- [ ] 2.1.1 Sticky header 조건부 렌더링 제거
  - [ ] `{!selectedDateISO && (<div className="sticky...">` 블록 제거
- [ ] 2.1.2 날짜별 그룹핑 로직 유지
  - [ ] `groupMatchesByDate` 함수는 유지 (날짜 순서 정렬용)
  - [ ] 그룹 간 구분선 추가 (선택적): 얇은 `<Separator />` 또는 `border-t`

### 2.2 스크롤 관련 코드 정리
- [ ] 2.2.1 `useScrollDirection` 훅 사용 여부 검토
  - [ ] Sticky header 제거 후 불필요한 경우 제거
- [ ] 2.2.2 `isScrolled` 상태 관련 로직 정리

## Phase 3: 신청 상태 표시

### 3.1 shadcn/ui Badge 컴포넌트 추가
- [ ] 3.1.1 `npx shadcn@latest add badge` 실행
- [ ] 3.1.2 `src/shared/ui/shadcn/badge.tsx` 생성 확인

### 3.2 사용자 신청 상태 조회 쿼리 추가
- [ ] 3.2.1 `features/application/api/queries.ts`에 쿼리 추가
  ```typescript
  export function useUserApplications() {
    // 현재 로그인 사용자의 활성 신청 목록 조회
    // status IN ('PENDING', 'PAYMENT_PENDING', 'CONFIRMED')
    // match_id와 status만 반환 (경량)
  }
  ```
- [ ] 3.2.2 `features/application/api/keys.ts`에 쿼리 키 추가
  ```typescript
  userApplications: () => [...applicationKeys.all, 'user'] as const,
  ```

### 3.3 MatchListItem에 신청 상태 표시
- [x] 3.3.1 `applicationStatus` prop 추가
  ```typescript
  interface MatchListItemProps {
    match: Match;
    applicationStatus?: ApplicationStatusValue; // 추가
  }
  ```
- [x] 3.3.2 버튼 영역 조건부 렌더링
  - [x] `isClosed` → "모집 마감" Badge
  - [x] `applicationStatus` 존재 → 상태별 Badge
  - [x] 그 외 → "신청하기" Button
- [x] 3.3.3 Badge 스타일 정의
  ```typescript
  const STATUS_BADGE_VARIANT = {
    PENDING: 'warning',      // 승인대기 (yellow)
    PAYMENT_PENDING: 'info', // 입금대기 (blue)
    CONFIRMED: 'success',    // 참여확정 (green)
  };
  ```

### 3.4 page.tsx에 신청 상태 통합
- [ ] 3.4.1 `useUserApplications` 쿼리 호출
- [ ] 3.4.2 matchId → status Map 생성
  ```typescript
  const applicationStatusMap = useMemo(() => {
    if (!applications) return new Map();
    return new Map(applications.map(app => [app.matchId, app.status]));
  }, [applications]);
  ```
- [ ] 3.4.3 MatchListItem에 applicationStatus prop 전달

## Phase 4: 페이지네이션

### 4.1 Infinite Query 구현
- [ ] 4.1.1 `features/match/api/queries.ts`에 추가
  ```typescript
  export function useRecruitingMatchesInfinite(filters: MatchFilters) {
    return useInfiniteQuery({
      queryKey: matchKeys.listInfinite(filters),
      queryFn: ({ pageParam }) => fetchMatchesPage({ pageParam, filters }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: 0,
    });
  }
  ```
- [ ] 4.1.2 `features/match/api/keys.ts`에 쿼리 키 추가
  ```typescript
  listInfinite: (filters: MatchFilters) => [...matchKeys.lists(), 'infinite', filters] as const,
  ```
- [ ] 4.1.3 `features/match/api/match-api.ts`에 페이지네이션 함수 추가
  ```typescript
  export async function fetchMatchesPage({
    supabase, pageParam, filters, pageSize = 20
  }) {
    // .range(pageParam, pageParam + pageSize - 1)
    // return { matches, nextCursor }
  }
  ```

### 4.2 오늘 이전 매치 필터링
- [ ] 4.2.1 쿼리에 날짜 필터 추가
  ```typescript
  .gte('date', todayISO())
  ```
- [ ] 4.2.2 `todayISO()` 유틸 함수 확인/생성

### 4.3 page.tsx 페이지네이션 적용
- [ ] 4.3.1 `useRecruitingMatches` → `useRecruitingMatchesInfinite` 변경
- [ ] 4.3.2 `data.pages.flatMap()` 으로 매치 배열 생성
- [ ] 4.3.3 "더 보기" 버튼 UI 추가
  ```tsx
  {hasNextPage && (
    <div className="flex justify-center py-6">
      <Button variant="outline" onClick={() => fetchNextPage()}>
        {isFetchingNextPage ? <Spinner /> : null}
        더 보기
      </Button>
    </div>
  )}
  ```
- [ ] 4.3.4 로딩 상태 처리
  - [ ] 초기 로딩: 기존 스피너
  - [ ] 추가 로딩: 버튼 내 스피너

## Phase 5: 필터 및 기타 기능

### 5.1 마감 가리기 필터 추가
- [ ] 5.1.1 FilterBar Props 확장
  ```typescript
  interface FilterBarProps {
    // 기존 props...
    hideClosed?: boolean;
    onHideClosedChange?: (hide: boolean) => void;
  }
  ```
- [ ] 5.1.2 DetailedFilterModal에 토글 추가
  - [ ] "마감된 경기 가리기" Switch 추가
  - [ ] 상세 필터 count에 포함
- [ ] 5.1.3 page.tsx에 상태 추가
  ```typescript
  const [hideClosed, setHideClosed] = useLocalStorage<boolean>('filter_hide_closed', false);
  ```
- [ ] 5.1.4 filterMatches 함수에 hideClosed 조건 추가

### 5.2 NEW 뱃지 구현
- [x] 5.2.1 `isNewMatch` 유틸 함수 생성
  ```typescript
  // features/match/lib/utils.ts
  export function isNewMatch(createdAt: string): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffHours <= 1;
  }
  ```
- [x] 5.2.2 GuestListMatch 타입에 `createdAt` 필드 확인
  - [x] 없으면 쿼리에서 `created_at` 포함하도록 수정
- [x] 5.2.3 MatchListItem에 NEW 뱃지 렌더링
  ```tsx
  {isNewMatch(match.createdAt) && (
    <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0">
      NEW
    </Badge>
  )}
  ```

### 5.3 adaptMatch 함수 업데이트
- [ ] 5.3.1 `createdAt` 필드 매핑 추가
- [ ] 5.3.2 ANY 포지션 처리 로직 추가

## Phase 6: 테스트 및 검증

### 6.1 빌드 검증
- [ ] 6.1.1 `npm run build` 성공 확인
- [ ] 6.1.2 TypeScript 에러 0개 확인
- [ ] 6.1.3 ESLint 에러 0개 확인

### 6.2 기능 테스트
- [ ] 6.2.1 카드 UI 변경 확인
  - [ ] 날짜+시간 통합 표시 확인
  - [ ] 성별/게임 방식 chip 하단 이동 확인
  - [ ] 포지션 "포지션 무관" 표시 확인
- [ ] 6.2.2 신청 상태 표시 확인
  - [ ] 로그인 후 신청한 매치에 Badge 표시 확인
  - [ ] 비로그인 시 신청하기 버튼만 표시 확인
- [ ] 6.2.3 페이지네이션 확인
  - [ ] 초기 20개 로드 확인
  - [ ] "더 보기" 버튼 클릭 시 추가 로드 확인
  - [ ] 더 이상 데이터 없을 때 버튼 숨김 확인
- [ ] 6.2.4 필터 동작 확인
  - [ ] 마감 가리기 토글 동작 확인
  - [ ] 기존 필터와 조합 동작 확인
- [ ] 6.2.5 NEW 뱃지 확인
  - [ ] 1시간 이내 생성 매치에 표시 확인

### 6.3 UI 일관성 검증
- [ ] 6.3.1 모바일 레이아웃 확인 (max-w-[430px])
- [ ] 6.3.2 스크롤 동작 확인 (Sticky header 제거 후)
- [ ] 6.3.3 다크모드 확인 (해당 시)

---

## Summary

| Phase | 주요 작업 | 예상 파일 변경 |
|-------|----------|--------------|
| 1 | 카드 UI 구조 변경 | match-list-item.tsx, page.tsx |
| 2 | Sticky Header 제거 | page.tsx |
| 3 | 신청 상태 표시 | queries.ts, match-list-item.tsx, page.tsx, badge.tsx (신규) |
| 4 | 페이지네이션 | queries.ts, keys.ts, match-api.ts, page.tsx |
| 5 | 필터 및 기타 | filter-bar.tsx, detail-filter-modal.tsx, utils.ts |
| 6 | 테스트 | - |

## Dependencies

- `@/features/auth` - 로그인 상태 확인
- `@/features/application` - 사용자 신청 상태 조회
- shadcn/ui Badge - 상태 표시용
