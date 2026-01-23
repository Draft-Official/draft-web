# Change: Refactor Project File Structure

## Why

현재 파일 구조에 일관성이 없어 유지보수가 어렵습니다:

1. **레이어 분산**: `services/`, `widgets/`, `components/ui/`, `lib/`가 각각 존재
2. **죽은 코드**: `entities/` 폴더에 사용하지 않는 context 존재
3. **네이밍 불일치**: feature 이름이 URL/도메인 의미와 일치하지 않음
4. **문서 불일치**: ARCHITECTURE.md가 현재 구조와 맞지 않음
5. **파일명 혼재**: PascalCase와 kebab-case가 섞여 있음

## What Changes

### Target Structure (Feature-Based Architecture)

```
src/
├── middleware.ts
├── app/                        # [Routing Layer] URL과 페이지 껍데기만
│
├── features/                   # [Domain Layer] 기능별 비즈니스 로직
│   ├── auth/
│   │   ├── api/
│   │   │   ├── hooks/          # React Query hooks
│   │   │   │   ├── queries.ts
│   │   │   │   └── mutations.ts
│   │   │   ├── auth-api.ts     # Supabase 클라이언트 (kebab-case)
│   │   │   └── index.ts
│   │   ├── model/
│   │   ├── ui/
│   │   └── lib/
│   ├── match/
│   ├── schedule/               # (match-management에서 이름 변경)
│   ├── application/
│   ├── my/
│   └── team/                   # (host에서 이름 변경)
│
└── shared/                     # [Common Layer] 도메인 무관 자원
    ├── api/
    │   ├── supabase/           # client.ts, server.ts, middleware.ts
    │   └── query-client.ts
    ├── ui/
    │   ├── base/               # Atom (Button, Input - shadcn)
    │   └── layout/             # Organism (Header, BottomNav, Sidebar)
    └── lib/
        ├── utils.ts
        ├── errors.ts
        └── constants/
```

### 구체적 변경 사항

#### 1. Dead Code 제거 및 Feature Rename
- **삭제** `entities/` 폴더 (사용하지 않는 MatchProvider)
- **이름변경** `features/match-management/` → `features/schedule/`
- **이름변경** `features/host/` → `features/team/`

#### 2. Services → Features 통합
- **이동** `services/auth/` → `features/auth/api/auth-api.ts`
- **이동** `services/match/` → `features/match/api/match-api.ts` + `match-mapper.ts`
- **이동** `services/application/` → `features/application/api/application-api.ts`
- **이동** `services/gym/` → `shared/api/gym-api.ts` (도메인 무관)
- **이동** `services/team/` → `features/team/api/team-api.ts`
- **기존 hooks** → `features/*/api/hooks/` 하위로 이동

#### 3. Shared UI 정립
- **이동** `widgets/header.tsx` → `shared/ui/layout/header.tsx`
- **이동** `widgets/navigation/ui/*` → `shared/ui/layout/`
- **이동** `components/ui/*` → `shared/ui/base/`

#### 4. Infrastructure 통합
- **이동** `lib/supabase/*` → `shared/api/supabase/`
- **이동** `shared/lib/query-client.ts` → `shared/api/query-client.ts`

#### 5. 파일명 정규화 (kebab-case)
- `AuthGuard.tsx` → `auth-guard.tsx`
- `MatchListItem.tsx` → `match-list-item.tsx`
- (모든 PascalCase 파일명 변경)

#### 6. 문서 업데이트
- `ARCHITECTURE.md`, `CLAUDE.md`, `openspec/project.md` 동기화

## Impact

### 삭제되는 폴더
- `src/entities/`
- `src/services/` (이동 후)
- `src/widgets/` (이동 후)
- `src/components/` (이동 후)
- `src/lib/` (이동 후)

### 이름 변경되는 폴더
- `src/features/match-management/` → `src/features/schedule/`
- `src/features/host/` → `src/features/team/`

### 수정되는 파일
- `src/app/providers.tsx` (MatchProvider 제거)
- Import 경로 변경: ~50개 파일

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Import 경로 누락 | Medium | 각 단계 후 `npm run build` 실행 |
| VS Code 자동 import 실패 | Low | `cmd+shift+f`로 수동 검색 |
| Feature rename 누락 | Low | grep으로 old feature 이름 검색 |

## Success Criteria

- `npm run build` 성공
- `npm run lint` 성공
- 3-folder 구조 달성 (`app/`, `features/`, `shared/`)
- 모든 파일명 kebab-case
