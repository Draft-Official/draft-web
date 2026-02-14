
# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**DRAFT** is a basketball guest recruiting platform for Korean amateur basketball players. It's a mobile-first adaptive web app (max-width: 430px) built with Next.js 15 that aims to provide a native app-like experience.

**Target Users**: Basketball enthusiasts (Guests) and team organizers (Hosts)  
**Core Values**: Speed, Trust, Convenience

→ **For detailed business context**: See [docs/project-context.md](docs/project-context.md)

## Development Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Build & Production
npm run build        # Production build
npm start           # Start production server

# Linting
npm run lint        # Run ESLint
```

## Architecture (Quick Reference)

This project uses **Feature-Sliced Design (FSD)** with a 4-folder structure:

```
src/
├── app/                    # Next.js App Router (routing only)
│   ├── page.tsx
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── matches/
│   ├── team/
│   └── my/
│
├── entities/               # Business domain entities (독립적)
│   ├── team/               # Team domain
│   │   ├── model/types.ts  # Team types
│   │   ├── api/            # Team service
│   │   └── index.ts
│   ├── match/              # Match domain
│   ├── gym/                # Gym domain
│   └── application/        # Application domain
│
├── features/               # User features (entities 조합)
│   ├── auth/               # Authentication
│   ├── match/              # Match management
│   ├── team/               # Team management
│   └── my/                 # User profile
│
└── shared/                 # Infrastructure & utilities
    ├── api/                # Supabase, React Query
    ├── ui/                 # UI kit
    ├── lib/                # Utilities
    ├── config/             # Constants
    └── types/              # Technical types only
```

→ **For detailed architecture**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### Import Path Aliases

Always use these TypeScript path aliases:

```typescript
@/*                    # Root directory (./src/)
@/entities/*           # src/entities/* (domain entities)
@/features/*           # src/features/* (user features)
@/shared/*             # src/shared/* (infrastructure)
```

### Layer Dependency Rules (FSD)

```
app/      → entities/ + features/ + shared/
features/ → entities/ + shared/
entities/ → shared/

entities DO NOT import from other entities (독립적!)
features DO NOT import from other features
```

**핵심 원칙:**
1. **entities** = 순수 데이터 모델 (독립적, ID만 참조)
2. **features** = 사용자 기능 (여러 entities 조합)
3. **shared** = 인프라 & 기술 타입만

**예시:**
```typescript
// ✅ entities - 독립적 (ID만 참조)
// entities/match/model/types.ts
export interface Match {
  id: string;
  gymId: string;    // Gym ID만 (Gym 객체 참조 X)
  teamId?: string;  // Team ID만
}

// ✅ features - entities 조합
// features/match-detail/ui/match-detail-view.tsx
import { Match } from '@/entities/match';
import { Gym } from '@/entities/gym';
import { Team } from '@/entities/team';

function MatchDetail({ matchId }) {
  const match = useMatch(matchId);
  const gym = useGym(match.gymId);      // Feature에서 조합!
  const team = useTeam(match.teamId);   // Feature에서 조합!
}
```

---

## FSD Type Placement Rules ⚠️

**CRITICAL: Always check DB schema FIRST before deciding type placement!**

### 실수 방지 체크리스트

타입을 정의하기 전에 **반드시** 다음 순서로 확인:

1. ✅ **DB 스키마 확인** - 실제로 어떤 컬럼이 있는지?
2. ✅ **JSONB 타입 확인** - `shared/types/jsonb.types.ts`에 이미 있는지?
3. ✅ **Entity 소유권 판단** - 이 데이터가 어느 entity에 속하는지?
4. ✅ **공통 타입 여부** - 여러 entity에서 사용하는지?

### Rule 1: 위치 정보는 Gym의 속성

```typescript
// ❌ 잘못된 가정
// entities/match/model/types.ts
export interface Location {
  latitude: number;
  longitude: number;
}
export interface Match {
  location: Location;  // Match가 Location을 소유?
}

// ✅ 올바른 구조 (DB 스키마 기반)
// entities/gym/model/types.ts
export interface Gym {
  id: string;
  name: string;
  latitude: number;   // Gym의 속성!
  longitude: number;  // Gym의 속성!
}

// entities/match/model/types.ts
export interface Match {
  id: string;
  gymId: string;  // Gym ID만!
}

// features/match-detail/ (UI에서 조합)
const match = useMatch(matchId);
const gym = useGym(match.gymId);
// gym.latitude, gym.longitude 사용
```

### Rule 2: JSONB 공통 타입은 shared/types/

```typescript
// ✅ shared/types/jsonb.types.ts
// 사용 테이블: users, teams, matches (여러 테이블!)
export interface OperationInfo {
  type: 'PHONE' | 'KAKAO_OPEN_CHAT';
  phone?: string;
  url?: string;
}

export interface AccountInfo {
  bank?: string;
  number?: string;
  holder?: string;
}

// ✅ entities에서 사용
// entities/team/model/types.ts
import { OperationInfo, AccountInfo } from '@/shared/types/jsonb.types';
export interface Team {
  accountInfo: AccountInfo | null;
  operationInfo: OperationInfo | null;
}

// entities/match/model/types.ts
import { OperationInfo } from '@/shared/types/jsonb.types';
export interface Match {
  operationInfo: OperationInfo | null;
}
```

### Rule 3: UI 편의 타입 vs DB 타입 구분

```typescript
// DB에는 이렇게 저장됨
// matches 테이블
cost_type: 'FREE' | 'PAID' | 'BEVERAGE'
cost_amount: number

// ❌ entities에 UI 편의 타입 정의 금지
export interface PriceInfo {
  type: CostTypeValue;
  amount: number;
  displayText: string;  // UI 편의 필드
}

// ✅ entities는 DB 그대로
export interface Match {
  costType: CostTypeValue;
  costAmount: number;
}

// ✅ UI 로직은 features/에서
// features/match/lib/format-price.ts
export function formatPrice(match: Match): string {
  if (match.costType === 'FREE') return '무료';
  if (match.costType === 'BEVERAGE') return `음료수 ${match.costAmount}병`;
  return `${match.costAmount.toLocaleString()}원`;
}
```

### Rule 4: shared/types/는 기술 타입만

```typescript
// ✅ shared/types/에 있어야 할 것들
shared/types/
  ├── database.types.ts      // Supabase 생성 타입
  ├── jsonb.types.ts         // DB JSONB 스키마
  └── phone-verification.types.ts  // 인프라 타입

// ❌ shared/types/에 있으면 안 되는 것들
shared/types/
  ├── notification.types.ts  // → entities/notification/
  ├── match.types.ts         // → entities/match/
  └── team.types.ts          // → entities/team/

// 판단 기준: "비즈니스 도메인 개념인가?"
// Yes → entities/
// No → shared/types/
```

### Common Mistakes ⚠️

**실수 1: features/의 타입을 entities의 타입으로 착각**

```typescript
// features/match/model/types.ts 파일을 보고 착각
export interface Location { ... }  // UI 편의 타입
export interface GuestListMatch { ... }  // UI용 조합 타입

// → 실제 DB에는 없는 타입들!
// → DB 스키마를 먼저 확인했어야 함
```

**실수 2: Cross-import 필요하다고 착각**

```typescript
// ❌ 잘못된 생각
// "Team이 Match 타입을 사용하니까 @x cross-import 필요해!"

// ✅ 올바른 구조
// entities는 독립적! ID만 참조!
export interface Team {
  id: string;
}

export interface Match {
  teamId?: string;  // Team ID만
}

// features에서 조합!
const match = useMatch(matchId);
const team = useTeam(match.teamId);
```

**실수 3: 공통 JSONB 타입을 특정 entity 전용으로 착각**

```typescript
// ❌ OperationInfo를 Match 전용이라고 착각
// entities/match/model/types.ts
export interface OperationInfo { ... }

// ✅ 실제로는 여러 테이블에서 사용
// shared/types/jsonb.types.ts
// 사용 테이블: users, teams, matches
export interface OperationInfo { ... }
```

**실수 4: Nested props 사용 (React anti-pattern)**

```typescript
// ❌ 중첩된 객체 구조 (읽기 어렵고 디버깅 힘듦)
interface MatchCardProps {
  match: Match;
  gym: Gym;
  host: User;
  ui: {
    showBadge: boolean;
    priceDisplay: string;
  };
}

// ✅ Flat props (React 공식 권장)
interface MatchCardProps {
  matchId: string;
  gymName: string;
  gymAddress: string;
  latitude: number;
  longitude: number;
  hostName: string;
  showBadge: boolean;
  priceDisplay: string;
}

// features/match/ui/components/match-card.tsx
// Flat DTO를 컴포넌트에 전달
export function MatchCard(props: MatchCardProps) { ... }
```

**실수 5: N개의 개별 쿼리 실행 (N+1 문제)**

```typescript
// ❌ N개의 개별 service 호출
const match = await matchService.getMatch(id);
const gym = await gymService.getGym(match.gymId);
const host = await userService.getUser(match.hostId);
const team = await teamService.getTeam(match.teamId);
// → 4번의 개별 쿼리! (느림)

// ✅ JOIN 쿼리 한 번에 (features에서)
// features/match/api/queries.ts
const { data } = await supabase
  .from('matches')
  .select(`
    *,
    gyms(*),
    users!matches_host_id_fkey(*),
    teams(*)
  `)
  .eq('id', matchId)
  .single();
// → 1번의 쿼리! (빠름)
```

**실수 6: Entities 간 직접 import (Cross-dependency)**

```typescript
// ❌ Entity에서 다른 entity import (의존성 발생!)
// entities/application/api/mutations.ts
import { matchKeys } from '@/entities/match';  // ❌ Cross-dependency!

export function useCreateApplication() {
  return useMutation({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.match_id) });  // ❌
    }
  });
}

// ✅ Features에서 orchestration
// features/application/api/mutations.ts
import { matchKeys } from '@/entities/match';
import { applicationKeys } from '@/entities/application';

export function useCreateApplication() {
  return useMutation({
    onSuccess: (data) => {
      // ✅ Features에서 여러 entities invalidate!
      queryClient.invalidateQueries({ queryKey: applicationKeys.byMatch(data.match_id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.match_id) });
    }
  });
}
```

**핵심:**
- Entities = 완전히 독립적! 다른 entities import 금지!
- Features = 여러 entities 조합 및 orchestration
- **예외**: 2개 이상 entities에서 사용하는 공통 유틸은 `shared/`로

### 올바른 접근 순서

1. **DB 스키마 확인**
   ```sql
   \d matches  -- PostgreSQL
   -- 또는 Supabase Table Editor 확인
   ```

2. **shared/types/jsonb.types.ts 확인**
   - 이미 정의된 공통 타입 있는지 확인
   - 주석에 "사용 테이블" 명시되어 있음

3. **entities/ 타입 정의**
   - DB 컬럼 그대로 매핑
   - ID만 참조 (객체 참조 X)
   - JSONB 타입은 shared에서 import

4. **features/ UI 로직**
   - 여러 entities 조합
   - UI 편의 함수/타입 정의
   - 표시 형식 변환

---

## File Structure Rules

### 3-Folder Architecture

**app/** - Routing only
- ✅ Page shells, layouts, metadata
- ❌ Business logic, API calls, UI components

**features/** - Domain logic
- Each feature has: `api/`, `ui/`, `model/`, `lib/`
- API layer: `{name}-api.ts`, `{name}-mapper.ts`, `keys.ts`, `queries.ts`, `mutations.ts`
- All features export via `index.ts`

**shared/** - Cross-domain resources
- `api/`: Supabase clients, React Query config
- `ui/base/`: Custom atomic components (button, chip, input 등)
- `ui/shadcn/`: shadcn/ui 컴포넌트 (CLI로 추가된 것들)
- `ui/layout/`: Header, Sidebar, BottomNav
- `lib/`, `config/`, `types/`

### Component Type Definition Rules

**도메인 컴포넌트** → `model/types.ts` import
- 특정 비즈니스 엔티티를 표현하는 컴포넌트
- 예: `MatchListItem`, `TeamCard`, `ApplicationRow`

**순수 UI 컴포넌트** → 로컬 props interface 정의
- 도메인과 무관한 재사용 가능한 컴포넌트
- 예: `PositionChip`, `Badge`, `RegionFilterModal`
- feature 내부(`features/*/ui/`)든 전역(`shared/ui/`)이든 동일

**판단 기준:**
- "이 컴포넌트가 특정 도메인 엔티티(Match, Team 등) 전용인가?" → Yes면 model import
- "다른 feature에서도 쓰일 수 있나?" → Yes면 로컬 props

**변환은 한 곳에서만:**
- DB → Client 변환은 `mapper`에서 한 번만
- 컴포넌트 전달 전 추가 변환 금지 (`adaptMatch` 같은 패턴 지양)

```typescript
// ✅ 도메인 컴포넌트 - model import
import { GuestListMatch } from '@/features/match/model/types';
export function MatchListItem({ match }: { match: GuestListMatch }) { ... }

// ✅ 순수 UI 컴포넌트 - 로컬 props
interface PositionChipProps {
  label: string;
  max: number;
  current: number;
}
export function PositionChip({ label, max, current }: PositionChipProps) { ... }
```

### File Naming Convention

**ALL FILES MUST USE kebab-case:**

```
✅ match-card.tsx
✅ auth-guard.tsx
✅ match-api.ts
✅ profile-setup-modal.tsx

❌ MatchCard.tsx
❌ AuthGuard.tsx
❌ ProfileSetupModal.tsx
```

---

## Design System

### Brand Colors
- **Primary**: `#FF6600` (Orange) - Defined as `hsl(24 95% 53%)` in CSS variables
- Access via: `text-primary`, `bg-primary`, `border-primary`

### Layout Requirements
- **Mobile-First**: All UI must fit within `max-w-[430px]`
- **Sticky Positioning**:
  - Header: `top-0` (h-14)
  - FilterBar: `top-14` (below header)
  - Date section headers: `top-[195px]` (below FilterBar)

### Typography
Use Pretendard font (imported in globals.css)

---

## shadcn/ui 설정

### 폴더 구조
```
src/shared/ui/
├── base/       # 커스텀 컴포넌트 (button, chip, input 등)
└── shadcn/     # shadcn/ui CLI로 추가된 컴포넌트
```

### 컴포넌트 추가 방법
```bash
npx shadcn@latest add <component-name>
# 예: npx shadcn@latest add separator
```

컴포넌트는 자동으로 `src/shared/ui/shadcn/`에 추가됩니다.

### Import 규칙
```typescript
// shadcn 컴포넌트
import { Separator } from '@/shared/ui/shadcn/separator';

// 커스텀 컴포넌트
import { Button } from '@/shared/ui/base/button';
import { Chip } from '@/shared/ui/base/chip';
```

### 주의사항
- **폴더 분리 이유**: 기존 커스텀 컴포넌트와 이름 충돌 방지
- **수정 가능**: shadcn 컴포넌트는 직접 수정 가능 (node_modules가 아님)
- **업데이트 주의**: CLI로 업데이트 시 커스텀 수정사항이 덮어씌워질 수 있음
- **globals.css**: shadcn init 시 CSS 변수가 추가됨. 브랜드 색상(`--primary: 24 95% 53%`)이 덮어씌워지지 않도록 주의

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

---

## React Query Patterns

### API Layer Structure

```typescript
// features/{feature}/api/keys.ts
export const matchKeys = {
  all: ['matches'] as const,
  detail: (id: string) => [...matchKeys.all, 'detail', id] as const,
};

// features/{feature}/api/queries.ts
export function useMatch(id: string) {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const row = await getMatch(supabase, id);
      return matchRowToClientMatch(row);
    },
  });
}

// features/{feature}/api/mutations.ts
export function useCreateMatch() {
  return useMutation({
    mutationFn: async (input) => {
      const supabase = getSupabaseBrowserClient();
      return createMatch(supabase, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
}
```

### API Client Pattern

```typescript
// features/{feature}/api/{name}-api.ts
export async function getMatch(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new AppError(error.message);
  return data;
}
```

### Mapper Pattern

```typescript
// features/{feature}/api/{name}-mapper.ts
export function matchRowToClientMatch(row: MatchRow): ClientMatch {
  return {
    id: row.id,
    title: row.title,
    // ... type conversion (값 변환 X, 타입만 변환)
  };
}
```

### Enum & Constants Pattern

**규칙**: DB 값과 클라이언트 값을 동일하게 사용 (대문자 UPPER_SNAKE_CASE)

```typescript
// ❌ 잘못된 패턴 - 값 변환
const genderMap = { MALE: 'men', FEMALE: 'women' };
return { gender: genderMap[row.gender_rule] };  // DB: MALE → Client: men

// ✅ 올바른 패턴 - 값 그대로 사용
return { gender: row.gender_rule };  // DB: MALE → Client: MALE
```

**모든 매핑은 `shared/config/match-constants.ts`에서 관리:**

```typescript
// Constants 구조
export const GENDER_VALUES = ['MALE', 'FEMALE', 'MIXED'] as const;
export type GenderValue = typeof GENDER_VALUES[number];
export const GENDER_LABELS: Record<GenderValue, string> = { MALE: '남성', ... };
export const GENDER_STYLES: Record<GenderValue, { color: string }> = { ... };
export const GENDER_OPTIONS = GENDER_VALUES.map(v => ({ value: v, label: GENDER_LABELS[v] }));
export const GENDER_DEFAULT: GenderValue = 'MALE';  // Form 초기값
```

**Form 초기값은 Constants DEFAULT 사용:**

```typescript
// ❌ 잘못된 패턴 - 하드코딩된 초기값
const [gender, setGender] = useState("men");

// ✅ 올바른 패턴 - Constants DEFAULT 사용
import { GENDER_DEFAULT } from '@/shared/config/match-constants';
const [gender, setGender] = useState(GENDER_DEFAULT);  // 'MALE'
```

**컴포넌트 내 매핑 정의 금지:**

```typescript
// ❌ 컴포넌트 내부에 매핑 정의
const GENDER_CONFIG = { men: { label: '남성' } };

// ✅ constants에서 import
import { GENDER_LABELS, GENDER_STYLES } from '@/shared/config/match-constants';
```

**Schema에서 Constants 참조:**

```typescript
// ❌ 잘못된 패턴 - 하드코딩된 enum
gameFormat: z.enum(['internal_2', 'internal_3', 'exchange'])
courtSize: z.enum(['regular', 'short', 'narrow'])
referee: z.enum(['self', 'member', 'pro'])

// ✅ 올바른 패턴 - Constants 참조
import { PLAY_STYLE_VALUES, COURT_SIZE_VALUES, REFEREE_TYPE_VALUES } from '@/shared/config/match-constants';
gameFormat: z.enum(PLAY_STYLE_VALUES)  // ['INTERNAL_2WAY', 'INTERNAL_3WAY', 'EXCHANGE']
courtSize: z.enum(COURT_SIZE_VALUES)   // ['REGULAR', 'SHORT', 'NARROW']
referee: z.enum(REFEREE_TYPE_VALUES)   // ['SELF', 'STAFF', 'PRO']
```

**Component Prop Types:**

```typescript
// ❌ 잘못된 패턴 - string 타입
interface Props {
  gender: string;
  setGender: (v: string) => void;
}

// ✅ 올바른 패턴 - 타입 명시
import { GenderValue } from '@/shared/config/match-constants';
interface Props {
  gender: GenderValue;
  setGender: (v: GenderValue) => void;
}
```

---

## Key Technical Patterns

### Sticky Positioning Hierarchy
The app uses multiple sticky layers. When adding sticky elements, calculate `top` based on:
- Header: 56px (h-14)
- FilterBar: ~139px (varies with content)
- Always test scroll behavior

### State Management
- **Local state**: React hooks (useState, useReducer)
- **Server state**: TanStack Query (React Query) with Supabase
- **Form state**: React Hook Form + Zod validation

### Responsive Behavior
Desktop: Centered column (max-w-[430px]) with dark background  
Mobile: Full-width app-like experience

```tsx
// Layout wrapper in app/layout.tsx
<div className="w-full max-w-[430px] mx-auto min-h-screen bg-white shadow-2xl">
```

---

## Critical Rules

### DO ✅
- Use FSD 4-folder architecture (`app/`, `entities/`, `features/`, `shared/`)
- Keep routing logic in `app/` directory only
- Use TypeScript path aliases (`@/entities/*`, `@/features/*`, `@/shared/*`)
- ALL filenames in kebab-case
- **Check DB schema FIRST** before defining types
- Check `shared/types/jsonb.types.ts` for existing common types
- Use React Query for all data fetching
- Follow mobile-first design (max-w-[430px])
- Use Primary color `#FF6600` for brand elements

### DON'T ❌
- Put business logic in `app/` directory
- Import entities from other entities (독립적!)
- Import features from other features
- Put business domain types in `shared/types/` (only technical types!)
- Assume type ownership without checking DB schema
- Create UI convenience types in entities (keep entities pure)
- Use PascalCase for filenames
- Access Supabase directly from UI components
- Use relative imports when aliases exist
- Create components wider than 430px
- Change sticky `top` values without testing scroll

### FSD Quick Check ⚠️

타입을 만들기 전에:
1. ✅ DB 스키마 확인했나?
2. ✅ `shared/types/jsonb.types.ts` 확인했나?
3. ✅ 이 타입이 어느 entity에 속하는지 명확한가?
4. ✅ 여러 entity에서 사용하는 공통 타입인가?

→ 명확하지 않으면 DB 스키마부터 다시 확인!

---

## Git Commit Guidelines

When completing tasks, commits should include Claude attribution:

```bash
git commit -m "$(cat <<'EOF'
feat: Add feature description

- Detail 1
- Detail 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Reference Documents

For deeper context, refer to:

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Detailed architecture, patterns, examples
- **[docs/project-context.md](docs/project-context.md)** - Project vision, MVP scope, target audience
- **[docs/FIGMA_TO_CODE.md](docs/FIGMA_TO_CODE.md)** - Figma → Draft conversion workflow
- **[openspec/project.md](openspec/project.md)** - Project specifications

---

**Last Updated**: 2026-02-14 (Added FSD type placement rules)
**Maintainer**: @beom
**Project**: Draft - 농구 용병 모집 플랫폼
