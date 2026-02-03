# Draft 프로젝트 아키텍처

> 1인 개발자를 위한 확장 가능한 농구 용병 모집 플랫폼

**최종 업데이트**: 2026-01-23

---

## 🏗️ 프로젝트 구조

```
draft-web/
├── src/
│   ├── app/                              # Next.js App Router (라우팅만)
│   │   ├── page.tsx                      # 경기 목록
│   │   ├── layout.tsx                    # 루트 레이아웃
│   │   ├── providers.tsx                 # Providers (React Query, Auth)
│   │   ├── matches/
│   │   │   ├── [id]/page.tsx             # 경기 상세
│   │   │   ├── [id]/manage/page.tsx      # 경기 관리 (호스트)
│   │   │   └── create/page.tsx           # 경기 생성
│   │   ├── tournaments/
│   │   │   ├── [id]/page.tsx             # 대회 상세
│   │   │   ├── [id]/manage/page.tsx      # 대회 관리
│   │   │   └── create/page.tsx           # 대회 생성
│   │   ├── schedule/page.tsx             # 경기 일정 관리
│   │   ├── team/
│   │   │   ├── page.tsx                  # 팀 대시보드
│   │   │   ├── [id]/page.tsx             # 팀 상세
│   │   │   └── [id]/manage/page.tsx      # 팀 관리
│   │   ├── my/page.tsx                   # 마이페이지
│   │   ├── auth/
│   │   │   ├── callback/route.ts         # OAuth 콜백
│   │   │   └── auth-code-error/page.tsx
│   │   ├── login/page.tsx
│   │   └── api/
│   │       ├── gyms/route.ts             # 체육관 검색
│   │       └── search-places/route.ts    # 카카오맵 API 프록시
│   │
│   ├── features/                         # 기능별 모듈 (Feature-Based Architecture)
│   │   ├── auth/                         # 인증 기능
│   │   │   ├── api/                      # React Query hooks + API 클라이언트
│   │   │   │   ├── auth-api.ts           # Supabase Auth 접근
│   │   │   │   ├── keys.ts               # Query keys
│   │   │   │   ├── queries.ts            # GET hooks
│   │   │   │   ├── mutations.ts          # POST/PUT/DELETE hooks
│   │   │   │   └── index.ts
│   │   │   ├── model/                    # 타입, Context
│   │   │   │   ├── auth-context.tsx      # AuthProvider
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   ├── ui/                       # UI 컴포넌트
│   │   │   │   ├── auth-guard.tsx        # 인증 가드
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── match/                        # 경기 기능
│   │   │   ├── api/
│   │   │   │   ├── match-api.ts          # Match DB 접근
│   │   │   │   ├── match-mapper.ts       # DB ↔ Client 타입 변환
│   │   │   │   ├── keys.ts
│   │   │   │   ├── queries.ts
│   │   │   │   ├── mutations.ts
│   │   │   │   └── index.ts
│   │   │   ├── ui/
│   │   │   ├── model/
│   │   │   └── create/                   # 경기 생성 UI
│   │   │
│   │   ├── schedule/                     # 경기 일정 관리
│   │   │   ├── api/
│   │   │   │   ├── keys.ts
│   │   │   │   ├── queries.ts
│   │   │   │   ├── mutations.ts
│   │   │   │   └── index.ts
│   │   │   ├── ui/
│   │   │   │   ├── match-management-view.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── match-card.tsx
│   │   │   │   │   └── filter-dropdown.tsx
│   │   │   │   └── detail/
│   │   │   ├── model/
│   │   │   └── config/
│   │   │
│   │   ├── application/                  # 신청 기능
│   │   │   ├── api/
│   │   │   │   ├── application-api.ts
│   │   │   │   ├── keys.ts
│   │   │   │   ├── queries.ts
│   │   │   │   ├── mutations.ts
│   │   │   │   └── index.ts
│   │   │   ├── ui/
│   │   │   │   ├── apply-modal.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── team/                         # 팀 관리
│   │   │   ├── api/
│   │   │   │   ├── team-api.ts
│   │   │   │   └── index.ts
│   │   │   ├── model/
│   │   │   │   ├── types.ts              # Match UI 타입 정의
│   │   │   │   └── index.ts
│   │   │   ├── ui/
│   │   │   │   ├── host-dashboard-view.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   └── my/                           # 마이페이지
│   │       ├── model/
│   │       │   └── types.ts
│   │       ├── ui/
│   │       │   ├── profile-card.tsx
│   │       │   ├── profile-setup-modal.tsx
│   │       │   ├── skill-slider.tsx
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── shared/                           # 전역 공유 자원
│   │   ├── api/                          # 🆕 공통 API + Infrastructure
│   │   │   ├── supabase/                 # Supabase 클라이언트
│   │   │   │   ├── client.ts             # 브라우저 클라이언트
│   │   │   │   ├── server.ts             # 서버 클라이언트 (RSC/API)
│   │   │   │   ├── middleware.ts         # 미들웨어 클라이언트
│   │   │   │   └── index.ts
│   │   │   ├── query-client.ts           # React Query 설정
│   │   │   ├── gym-api.ts                # 체육관 API
│   │   │   ├── gym.ts                    # 체육관 타입
│   │   │   ├── kakao-map.ts              # 카카오맵 API
│   │   │   └── index.ts
│   │   │
│   │   ├── ui/                           # 공통 UI 컴포넌트
│   │   │   ├── base/                     # 커스텀 Atomic UI (button, chip 등)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── chip.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── ... (커스텀 컴포넌트)
│   │   │   ├── shadcn/                   # shadcn/ui CLI로 추가된 컴포넌트
│   │   │   │   ├── separator.tsx
│   │   │   │   └── ... (CLI로 추가)
│   │   │   └── layout/                   # 레이아웃 컴포넌트
│   │   │       ├── header.tsx
│   │   │       ├── sidebar.tsx
│   │   │       ├── bottom-nav.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── lib/                          # 유틸리티
│   │   │   ├── utils.ts
│   │   │   └── errors.ts
│   │   │
│   │   ├── config/                       # 전역 설정
│   │   │   ├── match-constants.ts        # Match 관련 enum/라벨 매핑
│   │   │   └── skill-constants.ts
│   │   │
│   │   └── types/                        # 전역 타입
│   │       ├── match.ts
│   │       └── database.types.ts         # Supabase 타입 (자동생성)
│   │
│   └── middleware.ts                     # 인증 미들웨어
│
├── supabase/                             # Supabase 설정
│   └── schema.sql
│
├── openspec/                             # 프로젝트 문서
│   ├── project.md
│   └── changes/                          # 변경 제안서
│
└── docs/
    ├── ARCHITECTURE.md                   # 이 파일
    └── FIGMA_TO_CODE.md
```

---

## 📐 아키텍처 원칙

### 1. 3-Folder Architecture

Draft는 **Feature-Based Architecture**를 따르며, 소스 코드를 3개의 최상위 폴더로 구성합니다:

```
src/
├── app/       # Routing (Next.js App Router)
├── features/  # Feature modules (domain logic)
└── shared/    # Cross-cutting concerns
```

#### **app/** - 라우팅 전용
- **역할**: 페이지 라우팅, 메타데이터, providers 설정만 담당
- **금지사항**: 비즈니스 로직, API 호출 금지
- **파일**: `page.tsx`, `layout.tsx`, `route.ts`만 포함

```typescript
// ✅ Good: app/matches/[id]/page.tsx
export default function MatchDetailPage({ params }: { params: { id: string } }) {
  return <MatchDetailView matchId={params.id} />;  // UI는 features/에서
}

// ❌ Bad: 비즈니스 로직 포함
export default async function MatchDetailPage() {
  const supabase = createClient();  // ❌
  const data = await supabase.from('matches').select();  // ❌
}
```

#### **features/** - Feature 모듈
- **역할**: 도메인별 비즈니스 로직, UI, API, 타입 정의
- **구조**: 각 feature는 `api/`, `ui/`, `model/`, `lib/` 레이어로 구성
- **격리**: Feature 간 직접 import 최소화

**Feature 내부 구조:**
```
features/{feature-name}/
├── api/          # Data access layer
│   ├── {name}-api.ts      # Supabase 접근 로직
│   ├── {name}-mapper.ts   # DB ↔ Client 타입 변환
│   ├── keys.ts            # React Query keys
│   ├── queries.ts         # useQuery hooks
│   ├── mutations.ts       # useMutation hooks
│   └── index.ts           # Barrel export
├── ui/           # UI components
├── model/        # Types, schemas, context
└── lib/          # Helper functions
```

#### **shared/** - 공통 리소스
- **역할**: Feature에 속하지 않는 크로스-도메인 리소스
- **포함**: API 인프라, UI 디자인 시스템, 유틸리티, 전역 타입

**Shared 구조:**
```
shared/
├── api/          # Infrastructure (Supabase, React Query)
├── ui/           # Design system
│   ├── base/     # 커스텀 컴포넌트 (button, chip, input 등)
│   ├── shadcn/   # shadcn/ui CLI로 추가된 컴포넌트
│   └── layout/   # Header, Sidebar, BottomNav
├── lib/          # Utilities (cn 함수 포함)
├── config/       # Global config
└── types/        # Global types
```

---

### 2. API Layer 패턴

모든 데이터 접근은 feature의 `api/` 레이어를 통해 이루어집니다.

```
┌─────────────────────────────────────────────────────────────┐
│  UI Layer (features/*/ui/)                                  │
│  - React Components                                         │
│  - useQuery/useMutation hooks 사용                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  API Layer (features/*/api/)                                │
│  - React Query hooks (queries.ts, mutations.ts)             │
│  - API 클라이언트 ({name}-api.ts)                           │
│  - Mapper ({name}-mapper.ts)                                │
│  - Query key 관리 (keys.ts)                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Infrastructure (shared/api/)                               │
│  - Supabase 클라이언트                                      │
│  - React Query 설정                                         │
└─────────────────────────────────────────────────────────────┘
```

**규칙: UI에서 직접 Supabase 호출 금지**

```typescript
// ❌ Bad: UI에서 직접 DB 호출
const { data } = await supabase.from('matches').select();

// ✅ Good: API 레이어 통해 호출
// features/match/api/match-api.ts
export async function getMatch(supabase: SupabaseClient, matchId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();
  
  if (error) throw new AppError(error.message);
  return data;
}

// features/match/api/queries.ts
export function useMatch(matchId: string) {
  return useQuery({
    queryKey: matchKeys.detail(matchId),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const row = await getMatch(supabase, matchId);
      return matchRowToClientMatch(row);  // Mapper
    },
  });
}

// features/match/ui/match-detail-view.tsx
function MatchDetailView({ matchId }: { matchId: string }) {
  const { data: match, isLoading } = useMatch(matchId);  // ✅
}
```

---

### 3. Barrel Exports

각 레이어는 `index.ts`를 통해 public API를 노출합니다.

```typescript
// features/auth/index.ts
export * from './api';
export * from './model';
export * from './ui';

// features/auth/api/index.ts
export { authKeys } from './keys';
export { useProfile, useSignOut } from './queries';
export { useSignInWithKakao } from './mutations';

// shared/ui/base/index.ts
export * from './button';
export * from './card';
export * from './dialog';
// ... 20개 base UI 컴포넌트
```

---

### 4. Enum & Constants Pattern

도메인 값(Gender, Position 등)의 매핑은 `shared/config/match-constants.ts`에서 단일 관리합니다.

**핵심 규칙:**
- DB 값과 클라이언트 값을 동일하게 사용 (대문자 UPPER_SNAKE_CASE)
- Mapper는 값 변환 없이 타입 변환만 수행
- UI 컴포넌트 내부에 매핑 정의 금지
- Form 초기값은 DEFAULT 상수 참조

**Constants 구조 패턴:**

```typescript
// shared/config/match-constants.ts (Single Source of Truth)

// 1. 값 정의 (as const로 타입 추론)
export const GENDER_VALUES = ['MALE', 'FEMALE', 'MIXED'] as const;
export type GenderValue = typeof GENDER_VALUES[number];

// 2. 라벨 매핑 (UI 표시용)
export const GENDER_LABELS: Record<GenderValue, string> = {
  MALE: '남성',
  FEMALE: '여성',
  MIXED: '성별 무관',
};

// 3. 스타일 매핑 (필요 시)
export const GENDER_STYLES: Record<GenderValue, { color: string }> = {
  MALE: { color: 'text-blue-600' },
  FEMALE: { color: 'text-pink-600' },
  MIXED: { color: 'text-purple-600' },
};

// 4. Options 배열 (Select/Chip용)
export const GENDER_OPTIONS = GENDER_VALUES.map(value => ({
  value,
  label: GENDER_LABELS[value],
}));

// 5. DEFAULT 값 (Form 초기값)
export const GENDER_DEFAULT: GenderValue = 'MALE';
```

**Form 초기값 패턴:**

```typescript
// ❌ 잘못된 패턴 - 하드코딩된 초기값
const [gender, setGender] = useState("men");
const [gameFormat, setGameFormat] = useState("internal_2");

// ✅ 올바른 패턴 - Constants DEFAULT 사용
import { GENDER_DEFAULT, PLAY_STYLE_DEFAULT } from '@/shared/config/match-constants';
const [gender, setGender] = useState(GENDER_DEFAULT);  // 'MALE'
const [gameFormat, setGameFormat] = useState(PLAY_STYLE_DEFAULT);  // 'INTERNAL_2WAY'
```

**Schema에서 Constants 참조:**

```typescript
// ❌ 잘못된 패턴 - 하드코딩된 enum 값
gameFormat: z.enum(['internal_2', 'internal_3', 'exchange'])

// ✅ 올바른 패턴 - Constants 참조
import { PLAY_STYLE_VALUES } from '@/shared/config/match-constants';
gameFormat: z.enum(PLAY_STYLE_VALUES)  // ['INTERNAL_2WAY', 'INTERNAL_3WAY', 'EXCHANGE']
```

**UI 컴포넌트 패턴:**

```typescript
// ❌ 잘못된 패턴 - 컴포넌트 내 매핑 정의
const GENDER_CONFIG = { men: { label: '남성' } };
<span>{GENDER_CONFIG[gender].label}</span>

// ✅ 올바른 패턴 - constants import
import { GENDER_LABELS, GENDER_STYLES } from '@/shared/config/match-constants';
<span className={GENDER_STYLES[gender].color}>
  {GENDER_LABELS[gender]}
</span>
```

**Mapper에서의 사용:**

```typescript
// features/match/api/match-mapper.ts
// 값 변환 없이 그대로 전달
return {
  gender: row.gender_rule,  // DB: 'MALE' → Client: 'MALE'
};

// ❌ 잘못된 패턴 - inline 매핑
const gameFormatMap = { internal_2: 'INTERNAL_2WAY' };
play_style: gameFormatMap[form.gameFormat]

// ✅ 올바른 패턴 - Form이 이미 대문자를 사용
play_style: form.gameFormat  // 이미 'INTERNAL_2WAY'
```

**Component Prop Types:**

```typescript
// ❌ 잘못된 패턴 - string 타입 (타입 안전성 부족)
interface MatchCreateSpecsProps {
  gender: string;
  setGender: (v: string) => void;
  gameFormat: string;
  setGameFormat: (v: string) => void;
}

// ✅ 올바른 패턴 - 명시적 타입 (컴파일 타임 에러 검출)
import { GenderValue, PlayStyleValue } from '@/shared/config/match-constants';

interface MatchCreateSpecsProps {
  gender: GenderValue;  // 'MALE' | 'FEMALE' | 'MIXED'만 허용
  setGender: (v: GenderValue) => void;
  gameFormat: PlayStyleValue;  // 'INTERNAL_2WAY' | 'INTERNAL_3WAY' | 'EXCHANGE'만 허용
  setGameFormat: (v: PlayStyleValue) => void;
}
```

---

## 🎯 기술 스택

| 카테고리 | 기술 | 용도 |
|---------|------|------|
| **Framework** | Next.js 15 (App Router) | SSR, Routing |
| **Language** | TypeScript | 타입 안정성 |
| **Styling** | Tailwind CSS 4 | 스타일링 |
| **UI Library** | shadcn/ui + Radix UI | 컴포넌트 |
| **State** | TanStack Query (React Query) | 서버 상태 관리 |
| **Backend** | Supabase | 인증 + DB + Storage |
| **Form** | React Hook Form + Zod | 폼 검증 |

### 핵심 패키지

```json
{
  "@supabase/supabase-js": "^2.x",
  "@supabase/ssr": "^0.x",
  "@tanstack/react-query": "^5.x",
  "@tanstack/react-query-devtools": "^5.x",
  "@tanstack/react-query-persist-client": "^5.x"
}
```

---

## 🎨 shadcn/ui 설정

### 폴더 구조

```
src/shared/ui/
├── base/       # 커스텀 컴포넌트 (기존 프로젝트 컴포넌트)
│   ├── button.tsx
│   ├── chip.tsx
│   └── input.tsx
└── shadcn/     # shadcn/ui CLI로 추가된 컴포넌트
    └── separator.tsx
```

**분리 이유**: 기존 커스텀 컴포넌트와 shadcn 컴포넌트의 이름 충돌 방지

### 컴포넌트 추가 방법

```bash
npx shadcn@latest add <component-name>
# 예: npx shadcn@latest add dialog
```

컴포넌트는 자동으로 `src/shared/ui/shadcn/`에 추가됩니다.

### Import 규칙

```typescript
// shadcn 컴포넌트
import { Separator } from '@/shared/ui/shadcn/separator';
import { Dialog } from '@/shared/ui/shadcn/dialog';

// 커스텀 컴포넌트
import { Button } from '@/shared/ui/base/button';
import { Chip } from '@/shared/ui/base/chip';
```

### components.json 경로 설정

```json
{
  "aliases": {
    "components": "@/shared/ui",
    "utils": "@/shared/lib/utils",
    "ui": "@/shared/ui/shadcn",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  }
}
```

### 주의사항

| 항목 | 설명 |
|------|------|
| **수정 가능** | shadcn 컴포넌트는 node_modules가 아니라 직접 수정 가능 |
| **업데이트 주의** | CLI로 업데이트 시 커스텀 수정사항이 덮어씌워질 수 있음 |
| **globals.css** | shadcn init 시 CSS 변수가 추가됨. 브랜드 색상 덮어쓰기 주의 |
| **cn 함수** | `@/shared/lib/utils.ts`의 `cn()` 함수 사용 (clsx + tailwind-merge) |

---

## 🔐 인증 시스템

### AuthProvider

전역 인증 상태는 `features/auth/model/auth-context.tsx`의 `AuthProvider`가 관리합니다.

```typescript
// src/app/providers.tsx
import { AuthProvider } from '@/features/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}

// 컴포넌트에서 사용
import { useAuth } from '@/features/auth';

function MyComponent() {
  const { user, profile, isAuthenticated, signOut } = useAuth();
}
```

### 보호된 라우트

```typescript
// src/middleware.ts
const PROTECTED_ROUTES = [
  '/matches/create',
  '/schedule',
  '/my',
  '/team',
];
```

### AuthGuard 컴포넌트

```typescript
import { AuthGuard } from '@/features/auth';

<AuthGuard 
  fallback={<Spinner />} 
  unauthenticated={<LoginPrompt />}
>
  <ProtectedContent />
</AuthGuard>
```

---

## 📊 React Query 패턴

### Query Keys

```typescript
// features/match/api/keys.ts
export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  detail: (id: string) => [...matchKeys.all, 'detail', id] as const,
  byHost: (hostId: string) => [...matchKeys.all, 'host', hostId] as const,
};
```

### Queries (GET)

```typescript
// features/match/api/queries.ts
import { useQuery } from '@tanstack/react-query';
import { matchKeys } from './keys';
import { getRecruitingMatches } from './match-api';
import { matchRowToClientMatch } from './match-mapper';

export function useRecruitingMatches() {
  return useQuery({
    queryKey: matchKeys.lists(),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const rows = await getRecruitingMatches(supabase);
      return rows.map(matchRowToClientMatch);
    },
  });
}
```

### Mutations (POST/PUT/DELETE)

```typescript
// features/match/api/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMatchInput) => {
      const supabase = getSupabaseBrowserClient();
      return createMatch(supabase, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      toast.success('경기가 생성되었습니다');
    },
    onError: (error) => {
      toast.error('경기 생성에 실패했습니다');
    },
  });
}
```

---

## 🔄 타입 시스템

### 컴포넌트 타입 정의 원칙

컴포넌트의 props 타입을 정의할 때, **역할에 따라** 다른 전략을 사용합니다.

#### 1. 도메인 컴포넌트 → `model/types.ts` import

특정 비즈니스 엔티티를 표현하는 컴포넌트는 해당 feature의 `model/types.ts`에서 타입을 import합니다.

```typescript
// features/match/ui/match-list-item.tsx
import { GuestListMatch } from '@/features/match/model/types';

// ✅ 도메인 타입 직접 사용
export function MatchListItem({ match }: { match: GuestListMatch }) {
  return (
    <div>
      <h3>{match.title}</h3>
      <span>{match.location.address}</span>
      {/* match의 모든 필드에 타입 안전하게 접근 */}
    </div>
  );
}
```

**해당하는 컴포넌트:**
- `MatchListItem`, `MatchDetailCard` - Match 엔티티 전용
- `TeamCard`, `TeamMemberRow` - Team 엔티티 전용
- `ApplicationRow`, `ApplicationStatusBadge` - Application 엔티티 전용

#### 2. 순수 UI 컴포넌트 → 로컬 props interface 정의

도메인과 무관하게 재사용 가능한 프레젠테이션 컴포넌트는 로컬에서 props를 정의합니다.

```typescript
// features/match/ui/position-chip.tsx (또는 shared/ui/base/)

// ✅ 로컬 props 정의 - 도메인 타입 의존 없음
interface PositionChipProps {
  label: string;
  max: number;
  current: number;
  status?: 'open' | 'closed';
}

export function PositionChip({ label, max, current, status }: PositionChipProps) {
  return (
    <div className={status === 'closed' ? 'opacity-50' : ''}>
      {label}: {current}/{max}
    </div>
  );
}
```

**해당하는 컴포넌트:**
- `PositionChip` - 숫자와 라벨만 받음
- `RegionFilterModal` - 지역 문자열 배열만 받음
- `Badge`, `Chip`, `Avatar` - 범용 UI 요소

#### 3. 판단 기준

| 질문 | 답변 | 타입 전략 |
|------|------|----------|
| 이 컴포넌트가 특정 도메인 엔티티 전용인가? | Yes | `model/types.ts` import |
| 다른 feature에서도 사용 가능한가? | Yes | 로컬 props 정의 |
| 원시값(string, number 등)만 받으면 되는가? | Yes | 로컬 props 정의 |

#### 4. 변환은 Mapper에서 한 번만

```
DB Row → Mapper → ClientType → UI Component
         ↑
      변환은 여기서만!
```

```typescript
// ❌ 잘못된 패턴 - 컴포넌트 전달 전 추가 변환
// page.tsx
function adaptMatch(match: GuestListMatch) {  // ❌ 중간 변환 함수
  return { ...match, price: formatPrice(match.price) };
}
const adapted = matches.map(adaptMatch);
<MatchListItem match={adapted} />

// ✅ 올바른 패턴 - Mapper에서 완성된 타입 제공
// match-mapper.ts
export function matchRowToGuestListMatch(row: MatchRow): GuestListMatch {
  return {
    ...row,
    priceDisplay: formatPrice(row.cost_amount),  // UI용 필드 포함
  };
}

// page.tsx
<MatchListItem match={match} />  // 변환 없이 직접 전달
```

### DB 타입 vs 클라이언트 타입

```
Supabase (DB)                    Client (UI)
─────────────                    ───────────
position_type: 'guard'    ────▶  Position: 'G'
status: 'recruiting'      ────▶  MatchStatus.RECRUITING
fee: number               ────▶  PriceInfo { base, final }
match_date: '2026-01-23'  ────▶  date: '2026.01.23 (목)'
```

### Mapper 패턴

```typescript
// features/match/api/match-mapper.ts
import type { Database } from '@/shared/types/database.types';

type MatchRow = Database['public']['Tables']['matches']['Row'];

export function matchRowToClientMatch(row: MatchRow): ClientMatch {
  return {
    id: row.id,
    title: row.title,
    status: mapStatus(row.status),
    location: {
      name: row.location_name,
      address: row.location_address || '',
    },
    date: formatDate(row.match_date),
    // ... 변환 로직
  };
}
```

### Supabase 타입 자동 생성

```bash
# Supabase CLI로 타입 생성
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/shared/types/database.types.ts
```

### JSONB Type Layer (Layer 1.5)

Supabase가 생성한 `Json` 타입은 구체적이지 않으므로, 중간 레이어를 두어 타입을 강화합니다.

```typescript
// src/shared/types/jsonb.types.ts
export interface AccountInfo {
  bank?: string;
  number?: string;
  holder?: string;
}

// 사용 예시
import { AccountInfo } from '@/shared/types/jsonb.types';

const account = (user.account_info as unknown as AccountInfo);
```

---

## 📁 파일 명명 규칙

| 위치 | 명명 규칙 | 예시 |
|------|---------|------|
| **모든 파일** | **kebab-case** | `match-card.tsx`, `auth-guard.tsx` |
| API 클라이언트 | `{name}-api.ts` | `match-api.ts`, `auth-api.ts` |
| Mapper | `{name}-mapper.ts` | `match-mapper.ts` |
| Barrel export | `index.ts` | 모든 레이어마다 |

---

## ⚠️ 주의사항

### DO ✅

- ✅ Features의 `api/` 레이어를 통해 DB 접근
- ✅ React Query hooks를 통해 데이터 페칭
- ✅ 타입 변환은 mapper에서
- ✅ 파일명은 모두 kebab-case
- ✅ Barrel exports 활용

### DON'T ❌

- ❌ UI 컴포넌트에서 직접 Supabase 호출
- ❌ `app/` 폴더에 비즈니스 로직 작성
- ❌ Feature 간 직접 import (shared를 통해)
- ❌ PascalCase 파일명 (kebab-case만 사용)
- ❌ `any` 타입 사용

---

## 🔗 참고 문서

- **[CLAUDE.md](../CLAUDE.md)** - AI Assistant quick reference
- **[openspec/project.md](../openspec/project.md)** - 프로젝트 명세
- **[FIGMA_TO_CODE.md](FIGMA_TO_CODE.md)** - Figma UI 변환 가이드

### External Resources
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

**Last Updated**: 2026-01-25  
**Maintainer**: @beom  
**Project**: Draft - 농구 용병 모집 플랫폼
