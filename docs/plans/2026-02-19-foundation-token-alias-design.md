# Foundation Token Alias Design (Seed + shadcn)

작성일: 2026-02-19
상태: In Progress (Phase 1 적용 완료)

## 1. 목적

프로젝트 UI를 즉시 전면 교체하지 않고, Foundation 레이어를 먼저 정리한다.

- Seed Foundation 구조(팔레트/역할/상태/간격/반경/그라데이션/elevation)를 도입한다.
- 브랜드 네이밍은 `draft-*`로 통일한다.
- 브랜드 색 값은 Seed `carrot` 값을 사용한다.
- 기존 shadcn 컴포넌트는 유지하고, 브리지 변수 매핑으로 점진 이행한다.
- `Chip` 전환은 보류하고 Foundation 안정화에 집중한다.

## 2. 핵심 결정

### 2.1 토큰 전략

- Scale palette는 Foundation에서 정의한다.
- `draft`는 독립 값이 아니라 `carrot` 값 alias로 둔다.
- 예시: `--color-palette-draft-500: var(--color-palette-carrot-500);`

### 2.2 shadcn 연결 전략

- shadcn 컴포넌트는 `--primary`, `--background`, `--border` 등 semantic 변수를 사용한다.
- Foundation role 토큰을 shadcn semantic 변수로 매핑하는 브리지 레이어를 둔다.
- 컴포넌트 코드 대규모 수정 없이 디자인 시스템 전환을 시작한다.

### 2.3 파일 배치(FSD)

- Foundation CSS: `src/shared/ui/theme/foundation.css`
- shadcn bridge CSS: `src/shared/ui/theme/shadcn-bridge.css`
- 전역 엔트리: `app/globals.css`
- 토큰 상수(코드 참조용): `src/shared/config/seed-tokens.ts`

## 3. 아키텍처

토큰 흐름은 다음 순서를 가진다.

1. Palette token (`carrot`, `gray`, `blue`, ...)
2. Brand alias (`draft-* -> carrot-*`)
3. Semantic role token (`--color-fg-brand`, `--color-bg-layer-default`, ...)
4. shadcn bridge (`--primary`, `--background`, `--muted`, ...)
5. shadcn component utility class (`bg-primary`, `text-foreground`, ...)

## 4. 구현 결과(Phase 1)

적용 완료:

- `src/shared/ui/theme/foundation.css` 생성
- `src/shared/ui/theme/shadcn-bridge.css` 생성
- `app/globals.css`에 Foundation/bridge import 연결
- `app/globals.css`의 중복 `:root/.dark` 토큰 블록 제거
- `tailwind.config.ts`의 `draft` 팔레트를 carrot 값 기준으로 정렬
- `src/shared/config/seed-tokens.ts`를 alias 정책에 맞게 갱신

## 5. 검증

- `npm run build`: 성공
- `npm run lint`: 환경 이슈로 실패 (`eslint-config-next` + `@rushstack/eslint-patch` 호환 문제)

참고: lint 실패는 이번 변경 로직보다는 현재 ESLint 실행 환경 이슈로 확인됨.

## 6. 리스크 및 후속 작업

남은 리스크:

- 기능 코드에 남아있는 하드코딩 컬러(`[#FF6600]`, `orange-*`, `slate-*`)는 아직 role token 미전환
- 다크 모드 대비/상태 대비는 화면 단위 확인 필요

Phase 2 후보:

1. 하드코딩 컬러를 role token/semantic class로 점진 치환
2. `Badge`를 우선 시나리오 컴포넌트로 정렬
3. Inclusive design 체크리스트(대비/터치 타겟/모션) 도입

