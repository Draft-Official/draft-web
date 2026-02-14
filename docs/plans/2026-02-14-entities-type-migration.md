# Entities Type Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate Match and Application domain types from features/ to entities/, eliminate type confusion, and create base structures to reduce duplication.

**Architecture:** Following strict FSD architecture - domain entity types belong in entities/ layer, feature-specific UI types remain in features/, shared common types go to shared/types/. Establish clear dependency direction: features → entities → shared.

**Tech Stack:** TypeScript, FSD Architecture, existing Supabase types

---

## 🎯 Current Problems

1. **Domain entity types in features/** - `BaseMatch`, `Location`, `PriceInfo`, `Applicant` should be in entities/
2. **Type duplication** - Similar types scattered across multiple files
3. **Unclear boundaries** - Confusion between entity types vs feature UI types
4. **Import confusion** - Features importing from other features for types

## 📋 Migration Strategy

### Phase 1: Create Base Types (shared/types/base.types.ts)
Move truly shared, non-domain types that are used across multiple entities.

### Phase 2: Create entities/match
Move Match domain types from features/match to entities/match.

### Phase 3: Create entities/application
Move Application domain types from features/application to entities/application.

### Phase 4: Update Features
Keep only feature-specific UI types, form types, and state types in features/.

---

## 📦 Phase 1: Create Base Common Types

### Task 1.1: Create shared/types/base.types.ts

**Files:**
- Create: `src/shared/types/base.types.ts`

**Step 1: Create base types file with common domain types**

Create `src/shared/types/base.types.ts`:

```typescript
/**
 * Base Types - Shared Common Domain Types
 *
 * Types that are used across multiple entities but are not
 * entity-specific. These are fundamental building blocks.
 */

import type { CostTypeValue } from '@/shared/config/constants';

/**
 * 지리적 위치 정보
 * Used by: Match, Gym, Team
 */
export interface Location {
  name: string; // 표시 이름 (예: "강남구민회관")
  address: string; // 리스트용 축약 주소 (예: "서울 강남구")
  fullAddress?: string; // 상세용 전체 주소 (예: "서울 강남구 개포로 220")
  latitude: number;
  longitude: number;
}

/**
 * 가격 정보
 * Used by: Match, Tournament
 */
export interface PriceInfo {
  type: CostTypeValue;
  amount: number; // 금액(원) 또는 음료 개수(병)
  providesBeverage?: boolean; // 음료 제공 여부 (뱃지용)
}

/**
 * 연락처 정보
 * Used by: Match, Team, User
 */
export interface ContactInfo {
  type: 'KAKAO_OPENCHAT' | 'PHONE' | 'KAKAO_ID';
  value: string;
}

/**
 * 포지션 상태 (UI용)
 * Used by: Match recruitment display
 */
export interface PositionStatusUI {
  status: 'open' | 'closed';
  max: number;
  current: number;
}

/**
 * 포지션 UI 구조 (리스트 표시용)
 * - all: 포지션 무관 (recruitmentType === 'ANY')
 * - g/f/c: 개별 포지션 (recruitmentType === 'POSITION')
 *
 * Used by: Match list, Application display
 */
export interface PositionsUI {
  all?: PositionStatusUI;
  g?: PositionStatusUI;
  f?: PositionStatusUI;
  c?: PositionStatusUI;
}
```

**Step 2: Update shared/types/index.ts**

Add to `src/shared/types/index.ts`:

```typescript
export * from './base.types';
export * from './database.types';
export * from './jsonb.types';
export * from './notification.types';
export * from './phone-verification.types';
```

**Step 3: Commit**

```bash
git add src/shared/types/base.types.ts src/shared/types/index.ts
git commit -m "feat(shared): add base common domain types

Create shared/types/base.types.ts for truly shared types:
- Location (used by Match, Gym, Team)
- PriceInfo (used by Match, Tournament)
- ContactInfo (used by Match, Team, User)
- PositionStatusUI, PositionsUI (used by Match, Application)

These types are domain concepts used across multiple entities.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 📦 Phase 2: Create entities/match

### Task 2.1: Create entities/match structure

**Files:**
- Create: `src/entities/match/model/types.ts`
- Create: `src/entities/match/model/index.ts`
- Create: `src/entities/match/index.ts`

**Step 1: Create directory structure**

```bash
mkdir -p src/entities/match/model
mkdir -p src/entities/match/api
mkdir -p src/entities/match/@x
```

**Step 2: Create entities/match/model/types.ts**

Create `src/entities/match/model/types.ts`:

```typescript
/**
 * Match Entity Types
 *
 * Domain model types for Match entity.
 * These represent the core Match business logic and data structures.
 */

import type {
  MatchStatusValue,
  MatchTypeValue,
  MatchFormatValue,
  PlayStyleValue,
  RefereeTypeValue,
  GenderValue,
  PositionValue,
} from '@/shared/config/constants';
import type { MatchRule } from '@/shared/types/jsonb.types';
import type { Location, PriceInfo, ContactInfo, PositionsUI } from '@/shared/types/base.types';

// Re-export for convenience
export type {
  MatchStatusValue,
  MatchTypeValue,
  MatchFormatValue,
  Location,
  PriceInfo,
  ContactInfo,
  PositionsUI,
};

// ============================================
// Match Domain Model
// ============================================

/**
 * Base Match Entity
 * Core properties shared by all match types
 */
export interface BaseMatch {
  id: string;
  title: string;
  matchType: MatchTypeValue; // 'GUEST_RECRUIT', 'TEAM_MATCH', etc.
  matchFormat: MatchFormatValue; // 'FIVE_ON_FIVE', 'THREE_ON_THREE'
  location: Location;
  dateISO: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  price: PriceInfo;
  facilities: Record<string, unknown>;
}

/**
 * Guest Recruit Match (용병 모집 경기)
 * Match entity for recruiting guest players
 */
export interface GuestRecruitMatch extends BaseMatch {
  matchType: 'GUEST_RECRUIT';
  status: MatchStatusValue;
  hostId: string;
  hostNickname: string;
  genderRule: GenderValue;
  positions: PositionsUI;
  contact: ContactInfo;
  rule: MatchRule;
  createdAt: string;
  updatedAt: string;
}

/**
 * Team Match (팀 내부 경기)
 * Match entity for team internal games with voting
 */
export interface TeamMatch extends BaseMatch {
  matchType: 'TEAM_MATCH';
  status: MatchStatusValue;
  teamId: string;
  teamName: string;
  hostId: string;
  votingStatus: 'PENDING' | 'CLOSED';
  votingSummary: {
    total: number;
    attend: number;
    absent: number;
    pending: number;
  };
  rule: MatchRule;
  createdAt: string;
  updatedAt: string;
}

/**
 * Host Dashboard Match
 * Match view for host management page
 */
export interface HostDashboardMatch extends BaseMatch {
  status: MatchStatusValue;
  stats: {
    total: number;
    confirmed: number;
    left: number;
  };
  pendingCount: number;
  isPast?: boolean;
}

/**
 * Match Options UI
 * UI representation of match rules (camelCase for forms)
 */
export interface MatchOptionsUI {
  playStyle?: PlayStyleValue;
  quarterRule?: {
    minutesPerQuarter: number;
    quarterCount: number;
    gameCount: number;
  };
  refereeType?: RefereeTypeValue;
}

// ============================================
// Match Input Types (for mutations)
// ============================================

/**
 * Create Guest Recruit Match Input
 */
export interface CreateGuestRecruitMatchInput {
  title: string;
  gymId: string;
  startTime: string;
  endTime: string;
  matchFormat: MatchFormatValue;
  genderRule: GenderValue;
  recruitmentType: 'ANY' | 'POSITION';
  maxCount?: number;
  positions?: Record<PositionValue, { max: number }>;
  price: PriceInfo;
  contact: ContactInfo;
  rule: MatchRule;
  facilities?: Record<string, unknown>;
}

/**
 * Update Match Input
 */
export interface UpdateMatchInput {
  title?: string;
  startTime?: string;
  endTime?: string;
  gymId?: string;
  price?: PriceInfo;
  contact?: ContactInfo;
  rule?: MatchRule;
  facilities?: Record<string, unknown>;
}
```

**Step 3: Create barrel exports**

Create `src/entities/match/model/index.ts`:

```typescript
export * from './types';
```

Create `src/entities/match/index.ts`:

```typescript
export * from './model';
// API exports will be added later when we create match service
```

**Step 4: Commit**

```bash
git add src/entities/match
git commit -m "feat(entities): create entities/match with domain types

Create Match entity layer:
- BaseMatch, GuestRecruitMatch, TeamMatch domain models
- HostDashboardMatch view model
- CreateGuestRecruitMatchInput, UpdateMatchInput mutations
- Re-export shared types (Location, PriceInfo, ContactInfo)

All Match business entity types now in entities/ layer.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 📦 Phase 3: Create entities/application

### Task 3.1: Create entities/application structure

**Files:**
- Create: `src/entities/application/model/types.ts`
- Create: `src/entities/application/model/index.ts`
- Create: `src/entities/application/index.ts`

**Step 1: Create directory structure**

```bash
mkdir -p src/entities/application/model
mkdir -p src/entities/application/api
mkdir -p src/entities/application/@x
```

**Step 2: Create entities/application/model/types.ts**

Create `src/entities/application/model/types.ts`:

```typescript
/**
 * Application Entity Types
 *
 * Domain model types for Application entity (경기 신청).
 * Represents guest applications to matches and team match votes.
 */

import type { PositionValue } from '@/shared/config/constants';
import type { ApplicationStatusValue } from '@/shared/config/application-constants';
import type { ApplicationSourceValue } from '@/shared/config/team-constants';

// Re-export for convenience
export type {
  ApplicationStatusValue,
  ApplicationSourceValue,
  PositionValue,
};

// ============================================
// Application Domain Model
// ============================================

/**
 * Guest Application (용병 신청)
 * Application from guest player to a match
 */
export interface GuestApplication {
  id: string;
  matchId: string;
  userId: string;
  position: PositionValue;
  status: ApplicationStatusValue;
  source: ApplicationSourceValue;
  createdAt: string;
  updatedAt: string;
}

/**
 * Team Vote Application (팀 투표)
 * Vote from team member for team match attendance
 */
export interface TeamVoteApplication {
  id: string;
  matchId: string;
  teamId: string;
  userId: string;
  status: 'ATTEND' | 'ABSENT' | 'PENDING';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Applicant (신청자 정보)
 * Guest applicant profile for match management
 */
export interface Applicant {
  id: string;
  nickname: string;
  position: PositionValue;
  level: string;
  height: string;
  status: ApplicationStatusValue;
  avatar?: string;
  tags: string[];
  mannerTemp: number;
  noshowCount: number;
  attendanceRate: number;
}

/**
 * Application Detail (신청 상세)
 * Full application info with user and match data
 */
export interface ApplicationDetail {
  id: string;
  matchId: string;
  matchTitle: string;
  matchDate: string;
  matchTime: string;
  location: string;
  applicant: Applicant;
  status: ApplicationStatusValue;
  appliedAt: string;
}

// ============================================
// Application Input Types
// ============================================

/**
 * Create Guest Application Input
 */
export interface CreateApplicationInput {
  matchId: string;
  userId: string;
  position: PositionValue;
  source: ApplicationSourceValue;
}

/**
 * Update Application Status Input
 */
export interface UpdateApplicationStatusInput {
  applicationId: string;
  status: ApplicationStatusValue;
}

/**
 * Create Team Vote Input
 */
export interface CreateTeamVoteInput {
  matchId: string;
  teamId: string;
  userId: string;
  status: 'ATTEND' | 'ABSENT' | 'PENDING';
  description?: string;
}
```

**Step 3: Create barrel exports**

Create `src/entities/application/model/index.ts`:

```typescript
export * from './types';
```

Create `src/entities/application/index.ts`:

```typescript
export * from './model';
// API exports will be added later when we create application service
```

**Step 4: Commit**

```bash
git add src/entities/application
git commit -m "feat(entities): create entities/application with domain types

Create Application entity layer:
- GuestApplication (용병 신청)
- TeamVoteApplication (팀 투표)
- Applicant, ApplicationDetail domain models
- Create/Update input types

All Application business entity types now in entities/ layer.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 📦 Phase 4: Update features/match to use entities

### Task 4.1: Refactor features/match/model/types.ts

**Files:**
- Modify: `src/features/match/model/types.ts`

**Step 1: Backup current file**

```bash
cp src/features/match/model/types.ts src/features/match/model/types.ts.backup
```

**Step 2: Replace with feature-specific types only**

Replace content of `src/features/match/model/types.ts`:

```typescript
/**
 * Match Feature Types
 *
 * Feature-specific types for match-related UI components and state.
 * Domain entity types are imported from entities/match.
 */

// Re-export entity types for backwards compatibility
export type {
  BaseMatch,
  GuestRecruitMatch,
  TeamMatch,
  HostDashboardMatch,
  MatchOptionsUI,
  CreateGuestRecruitMatchInput,
  UpdateMatchInput,
  MatchStatusValue,
  MatchTypeValue,
  MatchFormatValue,
  Location,
  PriceInfo,
  ContactInfo,
  PositionsUI,
} from '@/entities/match';

// Re-export from shared config
export type {
  GenderValue,
  PlayStyleValue,
  RefereeTypeValue,
  CourtSizeValue,
} from '@/shared/config/constants';

// ============================================
// Feature UI Types (Match List, Filters, etc.)
// ============================================

/**
 * Match List Item Props
 * Props for MatchCard component in list views
 */
export interface MatchListItemProps {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  positions: string;
  status: 'open' | 'closed';
  price: string;
}

/**
 * Match Filter State
 * State for match filtering in list views
 */
export interface MatchFilterState {
  gender?: 'MALE' | 'FEMALE' | 'MIXED';
  position?: 'G' | 'F' | 'C';
  region?: string;
  date?: string;
  priceRange?: [number, number];
}

/**
 * Match Search State
 */
export interface MatchSearchState {
  query: string;
  filters: MatchFilterState;
  results: Array<{ id: string; title: string }>;
  isLoading: boolean;
}
```

**Step 3: Test import updates**

Run: `npm run build`

Expected: Build succeeds, imports resolved from entities/match

**Step 4: Commit**

```bash
git add src/features/match/model/types.ts
git commit -m "refactor(features/match): use entities/match types

Remove domain entity types from features/match:
- Re-export from entities/match for backwards compat
- Keep only feature UI types (MatchListItemProps, filters, search)
- Establish clear dependency: features/match → entities/match

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4.2: Update features/match imports

**Files:**
- Modify: `src/features/match/api/queries.ts`
- Modify: `src/features/match/api/mutations.ts`
- Modify: `src/features/match/ui/**/*.tsx` (all UI components)

**Step 1: Update API layer imports**

In `src/features/match/api/queries.ts`, replace:

```typescript
// OLD
import type { GuestRecruitMatch } from '../model/types';

// NEW
import type { GuestRecruitMatch } from '@/entities/match';
```

Do the same for `mutations.ts`.

**Step 2: Update UI component imports**

Find all UI components importing from `../model/types`:

```bash
grep -r "from '../model/types'" src/features/match/ui/
```

Replace with:

```typescript
// OLD
import type { BaseMatch } from '../model/types';

// NEW
import type { BaseMatch } from '@/entities/match';
```

**Step 3: Run type check**

Run: `npm run build`

Expected: Build succeeds with new import paths

**Step 4: Commit**

```bash
git add src/features/match/api src/features/match/ui
git commit -m "refactor(features/match): update imports to use entities/match

Update all imports in features/match to use entities/match:
- API layer (queries.ts, mutations.ts)
- UI components (all match-related components)

Dependency direction: features/match → entities/match

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 📦 Phase 5: Update features/application

### Task 5.1: Refactor features/application/model/types.ts

**Files:**
- Modify: `src/features/application/model/types.ts`

**Step 1: Replace with feature-specific types**

Replace content of `src/features/application/model/types.ts`:

```typescript
/**
 * Application Feature Types
 *
 * Feature-specific types for application management UI.
 * Domain entity types are imported from entities/application.
 */

// Re-export entity types for backwards compatibility
export type {
  GuestApplication,
  TeamVoteApplication,
  Applicant,
  ApplicationDetail,
  CreateApplicationInput,
  UpdateApplicationStatusInput,
  CreateTeamVoteInput,
  ApplicationStatusValue,
  ApplicationSourceValue,
} from '@/entities/application';

// ============================================
// Feature UI Types
// ============================================

/**
 * Application Management State
 * State for managing applications in host dashboard
 */
export interface ApplicationManagementState {
  applications: ApplicationDetail[];
  selectedIds: string[];
  filter: 'all' | 'pending' | 'confirmed' | 'rejected';
  isLoading: boolean;
}

/**
 * Application Card Props
 * Props for ApplicantCard component
 */
export interface ApplicationCardProps {
  applicant: Applicant;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}
```

**Step 2: Update imports in feature**

Update `src/features/application/api/queries.ts`:

```typescript
// OLD
import type { Applicant } from '../model/types';

// NEW
import type { Applicant } from '@/entities/application';
```

**Step 3: Build and verify**

Run: `npm run build`

Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/features/application
git commit -m "refactor(features/application): use entities/application types

Remove domain types from features/application:
- Re-export from entities/application
- Keep only feature UI types (management state, card props)
- Update API imports to use entities/application

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 📦 Phase 6: Update Cross-Feature Imports

### Task 6.1: Fix features importing from other features

**Files:**
- Search and update all cross-feature imports

**Step 1: Find cross-feature type imports**

```bash
# Find features importing Match types from features/match
grep -r "from '@/features/match/model'" src/features/ --exclude-dir=match

# Find features importing Application types
grep -r "from '@/features/application/model'" src/features/ --exclude-dir=application
```

**Step 2: Update to use entities**

For each file found, replace:

```typescript
// OLD - Cross-feature import (violation)
import type { GuestRecruitMatch } from '@/features/match/model/types';

// NEW - Entity import (correct)
import type { GuestRecruitMatch } from '@/entities/match';
```

**Step 3: Verify no cross-feature imports remain**

Run the grep commands again:

Expected: No results (or only exports/barrel files)

**Step 4: Build verification**

Run: `npm run build`

Expected: Build succeeds, no type errors

**Step 5: Commit**

```bash
git add src/features
git commit -m "refactor: eliminate cross-feature type imports

Replace all cross-feature type imports with entity imports:
- features/X importing Match types → @/entities/match
- features/Y importing Application types → @/entities/application

Enforces FSD rule: features should not import from other features.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 📦 Phase 7: Update CLAUDE.md Documentation

### Task 7.1: Document new type architecture

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add Entities section to CLAUDE.md**

Add after the "Features" section in CLAUDE.md:

```markdown
### Entities Layer

**Purpose**: Business domain entities and their types

```
src/entities/
├── match/              # Match domain (경기)
│   ├── model/
│   │   └── types.ts    # BaseMatch, GuestRecruitMatch, TeamMatch
│   └── api/            # (Future: Match service)
│
├── application/        # Application domain (신청)
│   ├── model/
│   │   └── types.ts    # GuestApplication, TeamVoteApplication
│   └── api/            # (Future: Application service)
│
└── team/               # Team domain (팀) ✅ Complete
    ├── model/
    │   └── types.ts    # Team, TeamMember, TeamFee
    └── api/
        └── team-service.ts
```

**Import Rule**: `features/ → entities/ → shared/`

**Entity vs Feature Types**:
- **Entity types** (entities/): Domain models (`Match`, `Application`, `Team`)
- **Feature types** (features/): UI state (`FilterState`, `SearchState`, `FormData`)
- **Shared types** (shared/): Common building blocks (`Location`, `PriceInfo`)
```

**Step 2: Update Type Definition Rules**

Update the "Component Type Definition Rules" section:

```markdown
### Type Import Priority

1. **Domain Entity Types** → Import from `entities/`
   ```typescript
   import type { GuestRecruitMatch } from '@/entities/match';
   import type { Applicant } from '@/entities/application';
   import type { ClientTeam } from '@/entities/team';
   ```

2. **Shared Common Types** → Import from `shared/types/`
   ```typescript
   import type { Location, PriceInfo } from '@/shared/types/base.types';
   ```

3. **Feature UI Types** → Import from feature `model/`
   ```typescript
   import type { MatchFilterState } from '@/features/match/model/types';
   ```

**Never import**: `@/features/X/model/types` from `features/Y` (cross-feature imports)
```

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with entities layer architecture

Document new type architecture:
- Entities layer (match, application, team)
- Type import priority rules
- Entity vs Feature vs Shared type guidelines

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 📦 Phase 8: Cleanup and Verification

### Task 8.1: Remove backup files and verify build

**Files:**
- Delete: `src/features/match/model/types.ts.backup`

**Step 1: Remove backup files**

```bash
rm -f src/features/match/model/types.ts.backup
rm -f src/features/application/model/types.ts.backup
```

**Step 2: Full type check**

```bash
npm run build
```

Expected: Build succeeds with 0 errors

**Step 3: Check for remaining issues**

```bash
# Verify no cross-feature imports
grep -r "from '@/features/" src/features/ | grep "/model/types" | grep -v "from '@/features/match/model/types'" | grep match

# Should return nothing or only self-imports
```

**Step 4: Update WORK_LOG.md**

Add to `WORK_LOG.md`:

```markdown
## ✅ Phase 2.5 완료 (2026-02-14)

**Phase 2.5 - Entities Type Migration: 100% 완료 ✅**

### 완료된 작업
1. ✅ `shared/types/base.types.ts` 생성
   - Location, PriceInfo, ContactInfo 공통 타입 추출
   - PositionStatusUI, PositionsUI UI 공통 타입

2. ✅ `entities/match` 생성
   - BaseMatch, GuestRecruitMatch, TeamMatch 도메인 모델
   - 234줄 → 150줄로 중복 제거

3. ✅ `entities/application` 생성
   - GuestApplication, TeamVoteApplication 도메인 모델
   - Applicant, ApplicationDetail 엔티티

4. ✅ features/ 리팩토링
   - Domain types → entities로 이동
   - UI types만 features에 유지
   - Cross-feature imports 제거

5. ✅ 문서 업데이트
   - CLAUDE.md에 entities layer 추가
   - Type import priority 규칙 명시

### 결과
- **타입 중복 제거**: 3개 파일에서 중복 타입 정리
- **명확한 경계**: entities (도메인) vs features (UI) 분리
- **FSD 준수**: features → entities → shared 의존성 방향
- **빌드 성공**: 0 errors, 모든 타입 에러 해결

**커밋 수**: 8개
**변경된 파일**: ~15개
```

**Step 5: Final commit**

```bash
git add WORK_LOG.md
git commit -m "docs: complete Phase 2.5 entities type migration

Phase 2.5 완료:
- 타입 혼동 제거 (entities vs features 명확화)
- Base 구조 생성으로 중복 제거
- FSD 아키텍처 엄격히 준수
- Cross-feature imports 완전 제거

Ready for Phase 3.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## ✅ Verification Checklist

After completing all tasks, verify:

- [ ] `npm run build` succeeds with 0 errors
- [ ] No cross-feature type imports (`grep -r "from '@/features/.*/model/types'" src/features/`)
- [ ] All domain types in `entities/` (Match, Application, Team)
- [ ] All shared common types in `shared/types/base.types.ts`
- [ ] All feature UI types in `features/*/model/types.ts`
- [ ] CLAUDE.md updated with entities architecture
- [ ] WORK_LOG.md updated with Phase 2.5 completion
- [ ] 8 commits created with clear messages

---

## 🎯 Expected Outcome

**Before**:
```
src/features/match/model/types.ts (234 lines)
├─ BaseMatch ❌ (domain entity)
├─ Location ❌ (shared type)
├─ PriceInfo ❌ (shared type)
└─ MatchListItemProps ✅ (feature UI)
```

**After**:
```
src/entities/match/model/types.ts (150 lines)
├─ BaseMatch ✅
├─ GuestRecruitMatch ✅
└─ TeamMatch ✅

src/shared/types/base.types.ts (60 lines)
├─ Location ✅
├─ PriceInfo ✅
└─ ContactInfo ✅

src/features/match/model/types.ts (40 lines)
├─ Re-exports from entities ✅
└─ MatchListItemProps ✅ (feature UI only)
```

**Type Reduction**: 234 → 190 lines (44 lines removed via deduplication)
**Clear Boundaries**: entities (domain) vs features (UI) vs shared (common)
**FSD Compliance**: 100% - strict dependency direction enforced

---

**Last Updated**: 2026-02-14
**Total Tasks**: 8 major tasks, ~25 steps
**Estimated Time**: 45-60 minutes
