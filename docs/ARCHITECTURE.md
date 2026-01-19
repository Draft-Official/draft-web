# Draft 프로젝트 아키텍처

> 1인 개발자를 위한 확장 가능한 농구 용병 모집 플랫폼

**최종 업데이트**: 2026-01-15

---

## 🏗️ 프로젝트 구조

```
draft-web/
├── app/                              # Next.js App Router (라우팅만)
│   ├── page.tsx                      # 경기 목록
│   ├── layout.tsx                    # 루트 레이아웃
│   ├── providers.tsx                 # Providers (React Query, Auth)
│   ├── middleware.ts                 # 인증 미들웨어
│   ├── match/
│   │   ├── create/page.tsx           # 경기 생성
│   │   └── management/page.tsx       # 경기 관리
│   ├── guest/[id]/page.tsx           # 게스트 상세
│   ├── my/page.tsx                   # 마이페이지
│   ├── auth/
│   │   └── callback/route.ts         # OAuth 콜백
│   └── api/
│       └── search-places/route.ts    # 카카오맵 API 프록시
│
├── src/                              # 소스 코드 (비즈니스 로직)
│   ├── lib/                          # 🆕 인프라 레이어
│   │   └── supabase/
│   │       ├── client.ts             # 브라우저 클라이언트
│   │       ├── server.ts             # 서버 클라이언트 (RSC/API)
│   │       ├── middleware.ts         # 미들웨어 클라이언트
│   │       └── index.ts
│   │
│   ├── services/                     # 🆕 서비스 레이어 (Data Access)
│   │   ├── match/
│   │   │   ├── match.service.ts      # Match DB 접근
│   │   │   ├── match.mapper.ts       # DB ↔ Client 타입 변환
│   │   │   └── index.ts
│   │   ├── auth/
│   │   │   ├── auth.service.ts       # Auth 관련 함수
│   │   │   └── index.ts
│   │   ├── application/
│   │   │   ├── application.service.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── features/                     # 기능별 모듈 (Feature-Sliced Design)
│   │   ├── match/
│   │   │   ├── ui/                   # UI 컴포넌트
│   │   │   ├── api/                  # 🆕 React Query hooks
│   │   │   │   ├── keys.ts           # Query key 관리
│   │   │   │   ├── queries.ts        # GET hooks
│   │   │   │   ├── mutations.ts      # POST/PUT/DELETE hooks
│   │   │   │   └── index.ts
│   │   │   ├── model/                # 타입, 스키마
│   │   │   └── lib/                  # 헬퍼 함수
│   │   ├── auth/                     # 🆕 인증 기능
│   │   │   ├── ui/
│   │   │   │   └── AuthGuard.tsx     # 인증 필요 컴포넌트 래퍼
│   │   │   ├── api/
│   │   │   │   ├── keys.ts
│   │   │   │   ├── queries.ts
│   │   │   │   └── mutations.ts
│   │   │   ├── model/
│   │   │   │   ├── auth-context.tsx  # AuthProvider
│   │   │   │   └── types.ts
│   │   │   └── index.ts
│   │   └── ... (host, my, match-management)
│   │
│   ├── shared/                       # 전역 공유 자원
│   │   ├── lib/
│   │   │   ├── utils.ts
│   │   │   ├── query-client.ts       # 🆕 React Query 설정
│   │   │   └── errors.ts             # 🆕 에러 타입 정의
│   │   ├── config/
│   │   ├── api/
│   │   │   └── kakao-map.ts
│   │   └── types/
│   │       ├── match.ts              # 클라이언트 타입
│   │       └── database.types.ts     # 🆕 Supabase 타입 (자동생성)
│   │
│   ├── entities/                     # 엔티티 (Context)
│   │   └── match/model/match-context.tsx
│   │
│   ├── widgets/                      # 레이아웃 컴포넌트
│   └── components/ui/                # shadcn/ui
│
├── supabase/
│   └── schema.sql                    # DB 스키마 + RLS 정책
│
└── docs/
    ├── ARCHITECTURE.md               # 이 파일
    ├── FIGMA_TO_CODE.md
    ├── project-context.md
    └── CHANGELOG.md
```

---

## 📐 설계 원칙

### 1. 3계층 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│  UI Layer (app/, features/*/ui/)                            │
│  - React Components                                         │
│  - React Query hooks 사용                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  API Layer (features/*/api/)                                │
│  - React Query hooks (queries.ts, mutations.ts)             │
│  - Query key 관리 (keys.ts)                                 │
│  - 캐싱, 로딩 상태, 에러 처리                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Service Layer (services/)                                  │
│  - Supabase DB 접근 캡슐화                                  │
│  - 비즈니스 로직                                            │
│  - 타입 변환 (mapper)                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Infrastructure Layer (lib/)                                │
│  - Supabase 클라이언트                                      │
│  - React Query 설정                                         │
└─────────────────────────────────────────────────────────────┘
```

### 2. Feature-Sliced Design

**왜 Feature-Sliced?**
- ✅ 1인 개발에 최적: 기능별 독립 개발
- ✅ 확장성: 팀 확대 시 충돌 최소화
- ✅ 유지보수: 기능 단위 수정/삭제 용이
- ✅ 재사용성: 공통 컴포넌트 자동 분리

**Feature 구조:**
```
src/features/{feature-name}/
├── ui/           # UI 컴포넌트
├── api/          # React Query hooks
├── model/        # 타입, 스키마, context
└── lib/          # 헬퍼 함수
```

### 3. 서비스 레이어 패턴

**규칙: UI에서 직접 Supabase 호출 금지**

```typescript
// ❌ Bad: UI에서 직접 DB 호출
const { data } = await supabase.from('matches').select();

// ✅ Good: 서비스 레이어 통해 호출
const matchService = createMatchService(supabase);
const matches = await matchService.getRecruitingMatches();
```

**장점:**
- DB 쿼리 로직 재사용
- 타입 변환 일관성
- 테스트 용이성
- 비즈니스 로직 캡슐화

---

## 🎯 기술 스택

### 현재 (Phase 2 Ready)

| 카테고리 | 기술 | 용도 |
|---------|------|------|
| **Framework** | Next.js 16 (App Router) | SSR, Routing |
| **Language** | TypeScript | 타입 안정성 |
| **Styling** | Tailwind CSS 4 | 스타일링 |
| **UI Library** | shadcn/ui + Radix UI | 컴포넌트 |
| **State** | React Query | 서버 상태 캐싱 |
| **Backend** | Supabase | 인증 + DB + Storage |
| **Form** | React Hook Form + Zod | 폼 검증 |

### 설치된 패키지

```bash
# Supabase
@supabase/supabase-js  # Supabase 클라이언트
@supabase/ssr          # SSR 지원 (쿠키 기반 세션)

# React Query
@tanstack/react-query         # 서버 상태 관리
@tanstack/react-query-devtools # 개발 도구
```

---

## 🔐 인증 시스템

### 인증 흐름

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Middleware │────▶│  Supabase   │
│  Component  │     │ (세션 갱신)  │     │    Auth     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ AuthProvider│
                    │  (Context)  │
                    └─────────────┘
```

### 보호된 라우트

```typescript
// app/middleware.ts
const PROTECTED_ROUTES = [
  '/match/create',
  '/match/management',
  '/my',
  '/team',
];
```

### AuthProvider 사용

```typescript
// 컴포넌트에서
const { user, profile, isAuthenticated, signOut } = useAuth();

// 인증 가드
<AuthGuard fallback={<Spinner />} unauthenticated={<LoginPrompt />}>
  <ProtectedContent />
</AuthGuard>
```

---

## 📊 React Query 사용법

### Query Keys

```typescript
// src/features/match/api/keys.ts
export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  detail: (id: string) => [...matchKeys.all, 'detail', id] as const,
  byHost: (hostId: string) => [...matchKeys.all, 'host', hostId] as const,
};
```

### Queries (GET)

```typescript
// src/features/match/api/queries.ts
export function useRecruitingMatches() {
  return useQuery({
    queryKey: matchKeys.lists(),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);
      const rows = await matchService.getRecruitingMatches();
      return rows.map(matchRowToGuestListMatch);
    },
  });
}
```

### Mutations (POST/PUT/DELETE)

```typescript
// src/features/match/api/mutations.ts
export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);
      return matchService.createMatch(insertData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      toast.success('경기가 생성되었습니다');
    },
  });
}
```

### 컴포넌트에서 사용

```typescript
function MatchList() {
  const { data: matches, isLoading, error } = useRecruitingMatches();
  const createMatch = useCreateMatch();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {matches?.map(match => <MatchCard key={match.id} match={match} />)}
      <Button onClick={() => createMatch.mutate(formData)}>
        경기 생성
      </Button>
    </div>
  );
}
```

---

## 🔄 타입 시스템

### DB 타입 vs 클라이언트 타입

```
Supabase (DB)                    Client (UI)
─────────────                    ───────────
position_type: 'guard'    ────▶  Position: 'G'
status: 'recruiting'      ────▶  MatchStatus.RECRUITING
fee: number               ────▶  PriceInfo { base, final }
```

### 타입 변환 (Mapper)

```typescript
// src/services/match/match.mapper.ts
export function matchRowToGuestListMatch(row: MatchRow): GuestListMatch {
  return {
    id: row.id,
    title: row.title,
    matchType: MatchType.GUEST_RECRUIT,
    location: {
      name: row.location_name,
      address: row.location_address || '',
    },
    // ... 변환 로직
  };
}
```

### Supabase 타입 자동 생성

```bash
# Supabase CLI로 타입 생성
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/shared/types/database.types.ts
```

---

## 📁 파일 명명 규칙

| 위치 | 명명 규칙 | 예시 |
|------|---------|------|
| `src/features/*/ui/*` | kebab-case or PascalCase | `match-list-item.tsx`, `FilterBar.tsx` |
| `src/features/*/api/*` | kebab-case | `queries.ts`, `mutations.ts` |
| `src/services/*` | kebab-case | `match.service.ts`, `match.mapper.ts` |
| `src/lib/*` | kebab-case | `client.ts`, `server.ts` |
| `src/shared/types/*` | kebab-case | `database.types.ts`, `match.ts` |

---

## 🚀 Supabase 연결하기

### 1. 환경 변수 설정

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase 프로젝트에서 스키마 실행

```sql
-- supabase/schema.sql 내용을 SQL Editor에서 실행
```

### 3. 타입 생성

```bash
npx supabase login
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/shared/types/database.types.ts
```

### 4. OAuth 설정 (Kakao, Google)

Supabase Dashboard > Authentication > Providers에서 설정

---

## ⚠️ 주의사항

### DO ✅

- ✅ 서비스 레이어를 통해 DB 접근
- ✅ React Query hooks를 통해 데이터 페칭
- ✅ 타입 변환은 mapper에서
- ✅ 에러 처리는 서비스 레이어에서
- ✅ Feature 단위로 개발

### DON'T ❌

- ❌ UI 컴포넌트에서 직접 Supabase 호출
- ❌ `any` 타입 사용
- ❌ Feature 간 직접 import
- ❌ App Router에 비즈니스 로직 작성

---

## 🔗 참고 문서

- **[CLAUDE.md](../CLAUDE.md)** - Quick reference guide for Claude Code
- **[FIGMA_TO_CODE.md](FIGMA_TO_CODE.md)** - Figma UI import workflow
- **[project-context.md](project-context.md)** - Business context and MVP scope
- **[CHANGELOG.md](CHANGELOG.md)** - Recent changes and milestones

### External Resources
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

**Last Updated**: 2026-01-15
**Maintainer**: @beom
**Project**: Draft - 농구 용병 모집 플랫폼
