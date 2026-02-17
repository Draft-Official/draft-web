# Layout Width Globalization Design

## Context

현재 코드베이스는 `max-w-[760px]`가 페이지/피처 전반에 분산되어 있고, 일부 fixed/sticky 오버레이는 `md:pl-[240px]`를 사용해 사이드바(`lg`) 기준과 불일치한다.

핵심 목표는 다음과 같다.

- `760px`/`430px`/`240px` 레이아웃 값을 전역 단일 소스로 통합
- 페이지별 하드코딩 값을 제거 가능한 구조로 전환
- 기존 기능/화면 동작 유지

## References

- FSD Layers (app/shared 책임 분리): https://feature-sliced.github.io/documentation/docs/reference/layers
- Seed Theming / global tokens: https://seed-design.io/react/getting-started/styling/theming
- Seed manual installation / root global styling entry: https://seed-design.io/react/getting-started/installation/manual

## Architecture

### 1) Global Layout Tokens

`app/globals.css`의 `:root`에 레이아웃 토큰을 추가한다.

- `--layout-content-max: 760px`
- `--layout-mobile-max: 430px`
- `--layout-sidebar-width: 240px`

### 2) Global Layout Utilities

`app/globals.css`의 `@layer utilities`에 재사용 유틸리티를 추가한다.

- `.app-content-container`: 본문 컨텐츠 폭(760)
- `.app-mobile-container`: 모바일 예외 폭(430)
- `.app-overlay-shell`: fixed overlay 외곽 래퍼
- `.app-overlay-shell--with-sidebar`: 데스크톱 사이드바 오프셋 적용(`lg`)
- `.app-overlay-content`: overlay 내부 컨텐츠 폭(760)

### 3) Migration Strategy

#### Phase 1 (Safe)

- `src/app/layout-shell.tsx`와 주요 오버레이 컴포넌트를 전역 유틸리티로 치환
- `md:pl-[240px]`/`md:left-[240px]`를 `lg` 기준으로 정렬
- `/signup/verify`의 `430px` 예외 유지

#### Phase 2 (Follow-up)

- 페이지/피처의 `max-w-[760px]` 하드코딩을 `app-content-container`로 치환
- 필요 시 중복 컨테이너 제거(레이아웃 shell과 중복되는 경우)

## Risk Analysis

### Risk A: Tablet 구간 정렬 깨짐

원인: 사이드바는 `lg`에만 표시되는데 오버레이 오프셋은 `md` 기준으로 적용됨.
대응: 오프셋 기준을 `lg`로 통일.

### Risk B: Double Container

원인: `LayoutShell`과 페이지 자체가 동시에 `max-w-[760px]`를 가짐.
대응: 1차는 값 치환만, 2차에서 중복 제거.

### Risk C: Signup Verify Regression

원인: 전역화 중 모바일 예외 폭 상실 가능.
대응: `/signup/verify` 분기에서 `app-mobile-container`로 명시적 유지.

## Validation

- 정적 스캔: `rg "max-w-\[760px\]|max-w-\[430px\]|md:pl-\[240px\]|md:left-\[240px\]" src app`
- 아키텍처 경계: `npm run check:architecture`
- 빌드: `npm run build`
- 수동 확인: 모바일/태블릿/데스크톱에서 본문 및 하단 고정바 정렬

