# Draft Web Architecture

Last Updated: 2026-02-19

## 1) 핵심 요약

이 프로젝트는 **Next.js App Router + FSD(Feature-Sliced Design)** 조합을 사용한다.

- Next 런타임 루트는 **`app/` 하나만** 사용한다.
- FSD 비즈니스 코드는 `src/*` 레이어에 둔다.
- `app/**/page.tsx`는 최대한 얇은 **Route Adapter**로 유지하고, 실제 페이지 조합은 `src/pages/*`가 담당한다.
- `src/app/*`는 Next 라우팅 루트가 아니라 **FSD app-runtime 레이어**(전역 provider/shell 조합)로 사용한다.

## 2) 현재 디렉터리 구조

```text
draft-web/
├── app/                              # Next App Router 루트 (단일)
│   ├── layout.tsx                    # 루트 레이아웃 (html/body + runtime 조립)
│   ├── globals.css                   # 전역 스타일
│   ├── error.tsx                     # 루트 에러 어댑터
│   ├── loading.tsx                   # 루트 로딩 어댑터
│   ├── not-found.tsx                 # 루트 404 어댑터
│   ├── (auth)/**/page.tsx            # auth 라우트 어댑터
│   ├── (main)/**/page.tsx            # main 라우트 어댑터
│   └── api/**/route.ts               # 서버 route handlers
│
├── src/
│   ├── app/                          # FSD app-runtime 레이어 (라우트 파일 금지)
│   │   ├── providers.tsx
│   │   ├── layout-shell.tsx
│   │   └── README.md
│   ├── pages/                        # 페이지 구성/조합 레이어
│   ├── entities/                     # 독립 도메인 엔티티
│   ├── features/                     # 유스케이스/기능 조합
│   └── shared/                       # 공통 인프라/유틸/UI
│
├── pages/README.md                   # root pages router placeholder
└── scripts/                          # 아키텍처 경계 검증 스크립트
```

## 3) 레이어 역할

### 3.1 `app/` (Root App Router Layer)

역할:
- Next가 인식하는 실제 라우팅 진입점
- route segment 파일(`page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`)
- API route handler(`route.ts`)

원칙:
- 라우트 페이지 파일은 비즈니스 조합을 직접 담지 않는다.
- `src/pages/*`를 re-export 하는 얇은 어댑터로 유지한다.

예시:

```tsx
// app/(main)/team/create/page.tsx
export { default } from '@/pages/team/create/page';
```

### 3.2 `src/app/` (FSD App Runtime Layer)

역할:
- 전역 provider 조합
- 앱 공통 레이아웃 셸 조합
- 라우팅과 독립적인 app 수준 런타임 로직

현재 파일:
- `src/app/providers.tsx`: QueryClient/Auth/캐시 복원 조합
- `src/app/layout-shell.tsx`: Sidebar/Header/BottomNav 및 signup verify 예외 셸 처리

`app/layout.tsx`는 이 레이어를 참조해 최종 runtime을 조립한다.

### 3.3 `src/pages/` (Page Composition Layer)

역할:
- URL별 화면 컴포지션
- feature/entity/shared를 조합한 페이지 단위 UI 및 데이터 오케스트레이션

주의:
- Next routing 파일 자체는 `app/`에 위치한다.
- `src/pages/*`는 라우팅 파일이 아니라 조합 구현이다.

### 3.4 `src/features/`

역할:
- 유저 행동 중심 기능(use-case) 단위
- 도메인 엔티티를 조합하고 UI/API/model/lib를 캡슐화
- 서버 전용 유스케이스는 `features/*/server/*`에 둔다.

### 3.5 `src/entities/`

역할:
- 테이블/도메인 단위 독립 모델과 기본 데이터 접근

강제 규칙:
- `src/entities` 내부에서 다른 entity를 alias import로 참조하지 않는다.

### 3.6 `src/shared/`

역할:
- 공통 인프라(Supabase, HTTP 응답 유틸, 서버 유틸)
- 공통 UI/유틸/설정/타입
- feature/entity 전반에서 재사용되는 횡단 관심사

## 4) 의존성 경계 규칙 (현재 강제됨)

### 4.1 Entities Cross-Import 금지

스크립트: `scripts/check-entities-cross-import.sh`

- 금지: `src/entities/**` 내부에서 `from '@/entities/...`

### 4.2 Route Adapter 경계

스크립트: `scripts/check-route-adapter-boundary.sh`

검증 대상:
- `app/**/page.tsx`
- `app/**/(loading|error|not-found).tsx`
- (호환 목적) `src/app/**` 내 동일 패턴 파일

규칙:
- Route adapter는 `@/pages/*`만 import 가능
- 형태는 `export { default } from '@/pages/...';`만 허용
- `@/features/*`, `@/entities/*`, `@/widgets/*` 직접 의존 금지

### 4.3 API Route 경계

스크립트: `scripts/check-api-route-boundary.sh`

검증 대상:
- `app/api/**/route.ts`

규칙:
- 금지: `@/entities/*`, `@/pages/*`, `@/features/*/(ui|api|model|lib)` 직접 import
- 허용 alias:
  - `@/shared/*`
  - `@/features/*/server/*`

## 5) 품질 게이트

`package.json` 기준 명령:

```bash
npm run check:entities-cross-import
npm run check:route-adapter-boundary
npm run check:api-route-boundary
npm run check:architecture
npm run build
```

정의:
- `check:architecture` = 위 3개 boundary check 통합 실행
- `lint`는 architecture check 통과 후 ESLint 수행

## 6) 새로운 화면 추가 규칙

1. `src/pages/.../page.tsx`에 실제 페이지 조합 구현
2. `app/(main|auth)/.../page.tsx`에 re-export 어댑터 추가
3. `npm run check:route-adapter-boundary` 실행
4. `npm run build` 확인

## 7) 새로운 API route 추가 규칙

1. `app/api/.../route.ts` 생성
2. 서버 로직은 우선 `src/features/<feature>/server/*` 또는 `src/shared/server/*`로 분리
3. route handler에서는 조립/입출력 변환만 수행
4. `npm run check:api-route-boundary` + `npm run build` 실행

## 8) 디자인 시스템/스타일링 상태

- 전역 스타일 엔트리는 `app/globals.css`다.
- Foundation 토큰은 `src/shared/ui/theme/foundation.css`에서 관리한다.
- shadcn 매핑 토큰은 `src/shared/ui/theme/shadcn-bridge.css`에서 관리한다.

### 8.1 UI 레이어 규칙 (고정)

- Primitive 컴포넌트: `src/shared/ui/shadcn/*`
- Composite 컴포넌트: `src/shared/ui/composite/*`
- 금지: `src/shared/ui/base/*` (레이어 삭제 완료, 재도입 금지)

### 8.2 스타일 규칙 (고정)

- 색상/보더/배경은 Foundation 또는 shadcn semantic token(`text-foreground`, `bg-muted`, `border-border` 등) 사용.
- 신규 코드에서 `slate-*`, hex literal(`#...`) 직접 사용 금지.
- 브랜드 계열은 `draft` alias 토큰(`--color-palette-draft-*`)을 우선 사용.

### 8.3 컴포넌트 추가 규칙

1. shadcn primitive가 이미 있으면 그대로 재사용한다.
2. 없으면 shadcn CLI로 추가한다 (`npx shadcn add <component>`).
3. 비즈니스 조합/복합 UI만 `composite`에 작성한다.

## 9) 현재 아키텍처 상태 평가

- **단일 Next 라우팅 루트(`app/`)**: 적용 완료
- **`src/app`의 역할 분리(runtime layer)**: 적용 완료
- **Route Adapter/API Route/Entities 경계 검증 스크립트**: 적용 완료
- **완전 엄격 FSD(모든 레이어 규칙을 정적 분석으로 100% 강제)**: 진행 중

현재는 실무적으로 강한 경계가 적용된 상태이며, 추가 ESLint boundary 규칙 확장으로 엄격도를 더 높일 수 있다.
