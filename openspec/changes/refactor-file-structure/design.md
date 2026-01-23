# Design: File Structure Refactor

## Context

Draft 웹앱은 여러 개발 단계를 거치며 구조적 불일치가 쌓였습니다:
- Phase 1: Mock data + local state (MatchProvider)
- Phase 2: Supabase + React Query

이 과정에서 `services/`, `widgets/`, `components/`, `lib/`, `entities/` 등 여러 레이어가 생겼고, 이제 **Feature-Based Architecture**로 정리합니다.

## Goals / Non-Goals

### Goals
- **3-folder 구조** 확립: `app/`, `features/`, `shared/`
- **kebab-case** 파일명 통일
- **api/ 내부 구조화**: hooks와 data-access 분리
- 죽은 코드 제거

### Non-Goals
- 비즈니스 로직 변경
- 새 기능 추가
- Supabase 패턴 변경

## Decisions

### Decision 1: api/ 폴더 내부 구조 (Option C 채택)

```
features/match/api/
├── hooks/              # React Query hooks (상태 관리)
│   ├── queries.ts      # useMatchList, useMatchDetail
│   ├── mutations.ts    # useCreateMatch
│   └── keys.ts         # Query keys
├── match-api.ts        # Supabase 직접 호출 (kebab-case)
├── match-mapper.ts     # DB ↔ Client 타입 변환 (kebab-case)
└── index.ts            # Barrel export
```

**Why Option C?**
- hooks는 "상태 관리" → UI 레이어와 가까움
- `*.api.ts`는 "데이터 접근" → 인프라 레이어와 가까움
- 같은 폴더 안에서도 역할 구분이 명확함

**호출 흐름:**
```
Component → useMatchList() → matchApi.getMatches() → Supabase
              (hooks/)         (match-api.ts)
```

### Decision 2: services/ 제거 → features/*/api/로 이동

**Before:**
```
src/services/
├── auth/auth.service.ts
├── match/match.service.ts
└── ...
```

**After:**
```
src/features/
├── auth/api/auth-api.ts
├── match/api/match-api.ts
└── ...
```

**Rationale:**
- Feature가 자신의 데이터 접근 로직을 소유
- "서버 통신" = api/ 폴더 (Decision Tree 기준)
- services 레이어 불필요

### Decision 3: shared/ui 구조

```
shared/ui/
├── base/       # Atom 단위 (shadcn components)
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
└── layout/     # Organism 단위 (레이아웃)
    ├── header.tsx
    ├── bottom-nav.tsx
    └── sidebar.tsx
```

**Why?**
- `widgets/`와 `components/ui/`를 하나로 통합
- Design System 관점에서 base(원자) / layout(유기체) 구분

### Decision 4: gym service → shared/api/

`gym.service.ts`는 특정 feature에 속하지 않는 공용 API이므로:
```
shared/api/gym.api.ts
```

### Decision 5: 파일명 kebab-case 강제

**Before:** `AuthGuard.tsx`, `MatchListItem.tsx`, `match.api.ts`
**After:** `auth-guard.tsx`, `match-list-item.tsx`, `match-api.ts`

**Why?**
- Linux/Mac 파일 시스템 호환성
- 일관된 규칙 → 인지 부하 감소
- dot notation(`match.api.ts`) 대신 hyphen(`match-api.ts`) 사용

### Decision 6: Feature 이름 일관성 확보

**현재 상태:**
- `features/match-management/`는 URL `/schedule`과 연결되어 있음
- `features/host/`는 URL `/team`과 연결되어 있음
- Feature 이름과 도메인 의미가 불일치

**결정:**
- `features/match-management/` → `features/schedule/`로 이름 변경
- `features/host/` → `features/team/`으로 이름 변경
- Feature 이름을 URL 및 도메인 의미와 일치시킴

## Target Structure

```
src/
├── middleware.ts
│
├── app/                          # [Routing] 주소만
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── page.tsx
│   ├── login/
│   ├── matches/
│   ├── schedule/                 # schedule feature와 연결
│   ├── tournaments/
│   ├── team/                     # team feature와 연결
│   └── my/
│
├── features/                     # [Domain] 기능별 로직
│   ├── auth/
│   │   ├── api/
│   │   │   ├── hooks/
│   │   │   │   ├── queries.ts
│   │   │   │   └── mutations.ts
│   │   │   ├── auth-api.ts
│   │   │   └── index.ts
│   │   ├── model/
│   │   │   ├── auth-context.tsx
│   │   │   └── types.ts
│   │   ├── ui/
│   │   │   └── auth-guard.tsx
│   │   └── index.ts
│   │
│   ├── match/
│   │   ├── api/
│   │   │   ├── hooks/
│   │   │   ├── match-api.ts
│   │   │   └── match-mapper.ts
│   │   ├── model/
│   │   ├── ui/
│   │   └── lib/
│   │
│   ├── schedule/               # (match-management에서 이름 변경)
│   ├── application/
│   ├── my/
│   └── team/                   # (host에서 이름 변경)
│
└── shared/                       # [Common] 공용 자원
    ├── api/
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   ├── server.ts
    │   │   └── middleware.ts
    │   ├── query-client.ts
    │   └── gym-api.ts
    │
    ├── ui/
    │   ├── base/                 # shadcn components
    │   └── layout/               # Header, BottomNav
    │
    └── lib/
        ├── utils.ts
        ├── errors.ts
        ├── constants/
        └── hooks/
```

## Migration Strategy

**안전한 이사 원칙:**
1. **이동 (Move)** - 파일을 새 위치로 이동
2. **참조 수정 (Update)** - import 경로 업데이트
3. **검증 (Verify)** - `npm run build`
4. **삭제 (Delete)** - 빈 폴더만 삭제

**절대 하지 않을 것:**
- 이동 전에 삭제
- 한 번에 모든 파일 이동
- 빌드 확인 없이 다음 단계 진행

## Risks / Trade-offs

### Risk: Import 경로 누락
- **Mitigation**: 각 단계 후 build, grep으로 old path 검색

### Trade-off: api/hooks/ depth 증가
- **Chosen**: 역할 명확성 > 경로 깊이
- 필요시 `@/features/match/api`로 barrel export

## Open Questions

None - 모든 결정 완료.
