# Home Desktop Split View Design

## Context

홈 화면에서 매치 카드를 클릭했을 때, 데스크톱에서는 좌측 리스트 + 우측 상세를 동시에 보여주는 2단 레이아웃이 필요하다. 모바일/태블릿 UX는 기존처럼 상세 페이지 라우팅을 유지해야 한다.

추가 제약:
- 현재 main content max-width는 `760px` 고정이라 split 렌더링에 부족함
- 현재 P0 작업(보안/정합성/매치 타입 분기)과 충돌을 최소화해야 함
- FSD 경계와 route adapter 패턴을 유지해야 함

## Approaches

### 1) Home query split (`/?match=<publicId>`) + desktop only (Recommended)
- 홈 페이지에서 `match` query를 상태로 사용
- `>=1024px`에서 카드 클릭 시 split panel 오픈
- `<1024px`는 기존처럼 `/matches/[id]` 라우팅
- 장점: `/matches/[id]` 핵심 흐름 변경 최소, P0 충돌 최소
- 단점: 홈 페이지 오케스트레이션 로직 증가

### 2) Separate desktop route (`/matches/split`)
- split 전용 라우트를 추가
- 장점: 기존 홈 로직과 분리
- 단점: 필터/리스트 중복 가능, 유지보수 비용 증가

### 3) Rebuild detail route for split-first
- `/matches/[id]` 중심으로 split UX 통합
- 장점: URL 일관성 우수
- 단점: 현재 P0 변경 파일과 충돌 위험 높음

## Decision

1번 적용.

## Architecture

- `app/(main)/page.tsx` route adapter는 유지
- `src/pages/home/page.tsx`에서 split 상태/렌더 오케스트레이션 담당
- `src/features/match/ui/match-list-item.tsx`는 선택 상태/클릭 핸들러 prop 지원
- `src/features/match/ui/match-detail-view.tsx`는 `layoutMode` 확장으로 page/split 공용화
- `src/shared/ui/shadcn/resizable.tsx` 추가로 shadcn 스타일 resizable 패널 구성
- `src/app/layout-shell.tsx`에서 home split 상태일 때 데스크톱 사이드바 숨김
- `app/globals.css`에 split max-width 토큰/유틸 추가

## Data Flow

1. User clicks a match card on desktop home
2. Home updates URL to `/?match=<publicId>`
3. Home detects split mode (`>=1024 && match query exists`)
4. Left panel renders list, right panel fetches detail via `useMatch(publicId)`
5. Close action removes `match` query (`/`)
6. On mobile, click navigates directly to `/matches/[id]`

## UX Rules

- Split 진입 임계값: `1024px`
- List panel: default 36%, min 30%, max 48%
- Detail panel: min 40%
- Selected card highlight
- Detail panel header에 닫기/전체 페이지 열기 제공
- 데스크톱 split 상태에서는 좌측 글로벌 사이드바 비표시

## Error Handling

- `match` query가 있지만 상세 조회 실패 시 우측 패널에서 에러 상태 + 닫기 버튼 제공
- 미존재 match id는 우측 패널에서 not found 상태 표시
- 모바일에서 `/?match=...`로 진입하면 `/matches/[id]`로 즉시 리다이렉트

## Verification Plan

- Architecture guard: `npm run check:architecture`
- Lint: `npm run lint`
- Build: `npm run build`
- Manual:
  - Desktop 1024+에서 카드 클릭 시 split 오픈
  - Resizable drag 동작
  - 닫기/전체페이지 이동
  - 모바일에서는 기존 풀페이지 이동 유지

