# Proposal: Match List Card UI 개선

## Why

현재 Match List의 카드 UI와 데이터 표시에 여러 개선점이 필요합니다:

1. **Sticky Header 비효율성**: 날짜별 sticky header가 스크롤 시 공간을 차지하고 UX를 복잡하게 만듦
2. **신청 상태 미표시**: 사용자가 이미 신청한 매치인지 리스트에서 확인 불가
3. **마감 매치 필터링**: 마감된 경기도 보이지만 가릴 수 있는 옵션 부재
4. **날짜 정보 미표시**: 카드 내에 날짜 정보가 없어 전체보기 시 혼란 발생
5. **NEW 뱃지 부재**: 새로 생성된 매치를 구분하기 어려움
6. **무한 로딩 미구현**: 매치가 많아질 경우 성능 이슈 발생 가능

## What Changes

### 1. Sticky Header → 카드 내 날짜 표시

**Before:**
- 날짜별 sticky header (`1월 28일 (화)`)가 고정되어 표시
- 카드에는 시간만 표시 (`19:00 ~ 21:00`)

**After:**
- Sticky header 삭제
- 카드 상단에 날짜+시간 통합 표시: `1월 28일 (화) 19:00 ~ 21:00`
- 시간 옆의 **게임 방식 chip, 성별 chip 삭제** (요구사항에 따라 유지할 컴포넌트)

### 2. 카드 구조 개선

**현재 구조:**
```
[시간] [5:5] [남성]                        [가격]
[체육관 이름] [📍주소]
[팀로고] [팀이름]
[포지션 chips...]                    [신청하기]
```

**변경 구조:**
```
[1월 28일 (화) 19:00 ~ 21:00]              [가격]
[체육관 이름] · [📍 서울 강남구] (강조)
[🏀/팀로고] [팀이름]
[포지션 무관/G/F/C chips] [성별] [5:5]  [신청하기/상태뱃지]
```

**변경 사항:**
- 날짜+시간 한 줄로 통합
- 체육관 이름과 주소를 한 줄에 (주소 조금 더 강조)
- 포지션 chip에서 `ANY` → `포지션 무관`으로 올바르게 매핑
- team_id 없으면 🏀 이모지 + `manual_team_name` 표시
- **성별, 게임 방식 chip은 하단으로 이동**
- 신청하기 버튼 클릭 시 상세 페이지(`/matches/[id]`)로 이동

### 3. 신청 상태 표시 (User Context)

사용자가 이미 신청한 매치일 경우:
- 신청하기 버튼 위치에 **상태 Badge** 표시
- 상태별 표시:
  - `PENDING` → "승인대기" (yellow)
  - `PAYMENT_PENDING` → "입금대기" (blue)
  - `CONFIRMED` → "참여확정" (green)
- shadcn/ui Badge 컴포넌트 사용
- 신청한 카드는 테두리 또는 배경색으로 구분 (선택적)

### 4. NEW 뱃지

- 매치 생성 후 1시간 이내인 경우 "NEW" 뱃지 표시
- 카드 우측 상단 또는 날짜 옆에 위치
- shadcn/ui Badge variant="destructive" 또는 custom orange 사용

### 5. 모집 상태 시각화

- `isClosed: true`인 경우 신청하기 버튼 → "모집 마감" 표시
- 마감된 카드는 opacity 처리 (현재 구현과 동일)

### 6. 필터: 마감 가리기 옵션

**FilterBar 상세 필터에 추가:**
- "마감된 경기 가리기" 토글 옵션
- 기본값: 꺼짐 (마감된 경기도 보임)
- 켜면 `isClosed: true`인 매치 필터링

### 7. 페이지네이션 방식

**추천: "더 보기" 버튼 방식**

이유:
1. 구현 난이도가 낮음
2. 사용자가 원하는 시점에 추가 로드 제어 가능
3. 실수로 무한 스크롤되는 것 방지
4. 네트워크 트래픽 예측 가능

구현:
- 초기 로드: 20개 매치
- "더 보기" 버튼 클릭 시 20개씩 추가 로드
- React Query의 `useInfiniteQuery` 활용
- 로딩 중 버튼 disabled + spinner

### 8. 오늘 이전 매치 필터링

- DB 쿼리 레벨에서 `date >= TODAY` 조건 추가
- 지난 매치는 기본적으로 표시하지 않음

## Capabilities

### New Capabilities
- `match-list-card`: 개선된 매치 리스트 카드 UI 컴포넌트 요구사항
- `user-application-status`: 현재 사용자의 매치별 신청 상태 조회 기능

### Modified Capabilities
_없음_

## Impact

### Affected Files

**UI Components:**
- `src/features/match/ui/match-list-item.tsx` - 카드 구조 전면 개편
- `src/features/match/ui/filter-bar.tsx` - 마감 가리기 필터 추가
- `src/features/match/ui/components/filter/detail-filter-modal.tsx` - 마감 가리기 토글 추가
- `src/app/page.tsx` - sticky header 제거, 페이지네이션 로직 추가

**API Layer:**
- `src/features/match/api/queries.ts` - useInfiniteQuery로 변경, 오늘 이전 매치 필터링
- `src/features/application/api/queries.ts` - 현재 사용자 신청 상태 조회 쿼리 추가

**Types:**
- `src/features/match/model/types.ts` - 신청 상태 필드 추가

**Shared:**
- `src/shared/ui/shadcn/badge.tsx` - 신규 추가 필요 (`npx shadcn@latest add badge`)

### Schema Changes
_없음 - 기존 스키마로 충분_

### Dependencies
- `@/features/application` API에서 사용자 신청 상태 조회 필요
- 로그인 상태 확인을 위해 `@/features/auth` 컨텍스트 사용

## Decisions Made

### D1: 신청한 매치 시각적 구분 방법
**결정: 버튼을 Badge로 대체**
- 신청하기 버튼 위치에 상태별 Badge 표시
- `PENDING` → "승인대기" (yellow)
- `PAYMENT_PENDING` → "입금대기" (blue)
- `CONFIRMED` → "참여확정" (green)

### D2: NEW 뱃지 위치
**결정: 날짜 옆에 표시**
- 예: `1월 28일 (화) 19:00 ~ 21:00 [NEW]`
- 매치 생성 후 1시간 이내인 경우 표시

### D3: 페이지네이션 방식
**결정: "더 보기" 버튼 방식**
- 초기 로드: 20개
- 버튼 클릭 시 20개씩 추가 로드
- React Query `useInfiniteQuery` 활용

## Summary

| 항목 | Before | After |
|------|--------|-------|
| 날짜 표시 | Sticky header | 카드 내 표시 |
| 시간 옆 칩 | 5:5, 성별 | 삭제 (하단 이동) |
| 체육관/주소 | 같은 크기 | 주소 강조 |
| 포지션 ANY | 미표시 | "포지션 무관" |
| 개인 주최 | 팀로고 | 🏀 + team_name |
| 신청 상태 | 미표시 | Badge 표시 |
| NEW 뱃지 | 없음 | 1시간 이내 표시 |
| 마감 필터 | 없음 | 상세 필터 내 토글 |
| 로딩 방식 | 전체 로드 | 더 보기 버튼 |
| 과거 매치 | 표시됨 | 자동 필터링 |

---

**예상 작업량**: 중간-대형 (카드 UI 전면 개편 + API 변경 + 필터 추가)
