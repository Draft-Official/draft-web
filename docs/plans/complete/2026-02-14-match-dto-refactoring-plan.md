# Match Feature DTO Refactoring Implementation Plan

> **Status**: ✅ **COMPLETED** (2026-02-14)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor features/match to use Flat DTOs following FSD + React best practices

**Architecture:** Incremental migration (6 phases) - add DTOs alongside legacy types, migrate queries/components step-by-step, then remove legacy types

**Tech Stack:** TypeScript, React Query, Supabase, FSD Architecture

**Completion**: All 6 phases completed, Match feature now uses flat DTOs with proper entity composition

---

## 📋 Phase 1: Foundation - Add DTO Types & Mappers

### Task 1.1: Create Formatter Utilities

**Files:**
- Create: `src/features/match/lib/formatters.ts`

**Step 1: Create formatters file with utility functions**

Create `src/features/match/lib/formatters.ts`:

```typescript
/**
 * Match Feature Formatting Utilities
 * UI 표시용 formatting 함수들
 */

import type {
  CostTypeValue,
  PositionValue,
} from '@/shared/config/constants';
import type { LevelRange, AgeRange, RecruitmentSetup } from '@/shared/types/jsonb.types';
import { getLevelLabel } from '@/shared/config/constants';

/**
 * 가격 표시 문자열 생성
 * @example formatPrice('FREE', 0) => "무료"
 * @example formatPrice('PAID', 10000) => "10,000원"
 * @example formatPrice('BEVERAGE', 2) => "음료수 2병"
 */
export function formatPrice(costType: CostTypeValue, amount: number | null): string {
  if (costType === 'FREE') return '무료';
  if (costType === 'BEVERAGE') return `음료수 ${amount ?? 0}병`;
  return `${(amount ?? 0).toLocaleString()}원`;
}

/**
 * 포지션 모집 현황 문자열 생성
 * @example "가드 1/3, 포워드 2/2"
 * @example "포지션 무관 3/5"
 */
export function formatPositions(recruitmentSetup: RecruitmentSetup): string {
  const { type, maxCount, positions } = recruitmentSetup;

  if (type === 'ANY' && maxCount) {
    const current = maxCount.current ?? 0;
    const max = maxCount.max;
    return `포지션 무관 ${current}/${max}`;
  }

  if (type === 'POSITION' && positions) {
    const positionLabels: Record<PositionValue, string> = {
      G: '가드',
      F: '포워드',
      C: '센터',
    };

    const formatted = (Object.keys(positions) as PositionValue[])
      .filter((pos) => positions[pos]?.max > 0)
      .map((pos) => {
        const { current = 0, max } = positions[pos]!;
        return `${positionLabels[pos]} ${current}/${max}`;
      })
      .join(', ');

    return formatted || '모집 없음';
  }

  return '모집 없음';
}

/**
 * 레벨 범위 표시 문자열 생성
 * @example "중수(B) 이상"
 * @example "상수(C) ~ 고수(A)"
 */
export function formatLevelRange(levelRange: LevelRange | null): string | null {
  if (!levelRange) return null;

  const { min, max } = levelRange;
  const minLabel = getLevelLabel(min);
  const maxLabel = getLevelLabel(max);

  if (min === max) return `${minLabel} 이상`;
  return `${minLabel} ~ ${maxLabel}`;
}

/**
 * 나이 범위 표시 문자열 생성
 * @example "20대 ~ 30대"
 * @example "20대 이상"
 */
export function formatAgeRange(ageRange: AgeRange | null): string | null {
  if (!ageRange) return null;

  const { min, max } = ageRange;
  const minLabel = `${Math.floor(min / 10) * 10}대`;
  const maxLabel = `${Math.floor(max / 10) * 10}대`;

  if (Math.floor(min / 10) === Math.floor(max / 10)) {
    return `${minLabel} 이상`;
  }

  return `${minLabel} ~ ${maxLabel}`;
}

/**
 * ISO timestamp에서 시간 추출
 * @example "2026-02-14T19:00:00Z" => "19:00"
 */
export function formatTime(isoString: string): string {
  return isoString.split('T')[1]?.substring(0, 5) ?? '';
}

/**
 * ISO timestamp에서 날짜 추출
 * @example "2026-02-14T19:00:00Z" => "2026-02-14"
 */
export function formatDateISO(isoString: string): string {
  return isoString.split('T')[0] ?? '';
}

/**
 * 24시간 이내 생성된 매치인지 확인
 */
export function isWithin24Hours(createdAt: string | null): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diff = now.getTime() - created.getTime();
  return diff < 24 * 60 * 60 * 1000;
}
```

**Step 2: Build verification**

Run: `npm run build`

Expected: Build succeeds, no type errors

**Step 3: Commit**

```bash
git add src/features/match/lib/formatters.ts
git commit -m "feat(match): add formatting utilities

Create formatters for DTO mappers:
- formatPrice (cost display)
- formatPositions (recruitment display)
- formatLevelRange, formatAgeRange
- formatTime, formatDateISO
- isWithin24Hours (NEW badge)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.2: Add DTO Types

**Files:**
- Modify: `src/features/match/model/types.ts`

**Step 1: Add DTO types at the top of the file**

Add to `src/features/match/model/types.ts` (after imports, before existing types):

```typescript
// ============================================
// DTO Types (NEW - Flat Structure)
// ============================================

/**
 * Match 리스트 아이템 DTO
 * 게스트 매치 목록 화면용 (홈, 검색 등)
 *
 * Flat structure for React performance optimization
 */
export interface MatchListItemDTO {
  // Match entity fields
  matchId: string;
  dateISO: string; // "2026-02-14"
  startTime: string; // "19:00"
  endTime: string; // "21:00"
  matchType: MatchTypeValue;
  matchFormat: MatchFormatValue;
  genderRule: GenderValue;
  status: MatchStatusValue | null;

  // Gym fields (flattened from entities/gym)
  gymId: string;
  gymName: string;
  gymAddress: string;
  gymLatitude: number;
  gymLongitude: number;

  // Host fields (flattened from entities/user)
  hostId: string;
  hostNickname: string | null;
  hostAvatar: string | null;

  // Team fields (flattened from entities/team)
  teamId: string | null;
  teamName: string | null;
  teamLogo: string | null;

  // Computed UI fields
  priceDisplay: string; // "10,000원" | "무료" | "음료수 2병"
  positionsDisplay: string; // "가드 1/3, 포워드 0/2"
  levelDisplay: string | null; // "중수(B) 이상"
  ageDisplay: string | null; // "20대~30대"
  isNew: boolean; // Created within 24 hours
  isClosed: boolean; // status === 'CLOSED'
}

/**
 * Match 상세 페이지 DTO
 * 경기 상세 정보 화면용
 *
 * Extends MatchListItemDTO with additional detail fields
 */
export interface MatchDetailDTO extends MatchListItemDTO {
  // Additional detail fields
  requirements: string[] | null;
  providesBeverage: boolean | null;

  // Recruitment status (computed)
  recruitmentStatus: {
    total: number;
    current: number;
    isFull: boolean;
  };

  // Match rule display (formatted)
  matchRuleDisplay: {
    playStyle: string; // "2파전" | "3파전" | "교류전"
    quarterTime: number;
    quarterCount: number;
    referee: string; // "자체 심판" | "스태프" | "전문 심판"
  } | null;

  // Contact info
  contactType: ContactTypeValue | null;
  contactValue: string | null;
}
```

**Step 2: Mark legacy types as deprecated**

Add `@deprecated` JSDoc comments to existing types:

```typescript
// ============================================
// Legacy Types (DEPRECATED - will be removed)
// ============================================

/**
 * @deprecated Use MatchListItemDTO instead
 * Will be removed after all components migrated
 */
export interface GuestListMatch {
  // ... existing definition
}

/**
 * @deprecated Use MatchDetailDTO instead
 * Will be removed after all components migrated
 */
export interface MatchDetailUI {
  // ... existing definition
}

/**
 * @deprecated Flattened into DTO types
 */
export interface Location {
  // ... existing definition
}

/**
 * @deprecated Computed field in DTO (priceDisplay)
 */
export interface PriceInfo {
  // ... existing definition
}

/**
 * @deprecated Use MatchDetailDTO.recruitmentStatus instead
 */
export interface PositionStatusUI {
  // ... existing definition
}

/**
 * @deprecated Use MatchListItemDTO.positionsDisplay instead
 */
export interface PositionsUI {
  // ... existing definition
}
```

**Step 3: Build verification**

Run: `npm run build`

Expected: Build succeeds, deprecation warnings but no errors

**Step 4: Commit**

```bash
git add src/features/match/model/types.ts
git commit -m "feat(match): add flat DTO types

Add MatchListItemDTO and MatchDetailDTO:
- Flat structure (all fields at top level)
- Pre-computed UI fields (priceDisplay, positionsDisplay)
- Extends pattern (DetailDTO extends ListItemDTO)

Mark legacy types as deprecated:
- GuestListMatch, MatchDetailUI
- Location, PriceInfo, PositionsUI

Legacy types kept for backward compatibility.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.3: Create DTO Mappers

**Files:**
- Create: `src/features/match/lib/mappers.ts`

**Step 1: Create mappers file with Entity → DTO functions**

Create `src/features/match/lib/mappers.ts`:

```typescript
/**
 * Match Feature DTO Mappers
 * Entity → DTO 변환 함수들
 */

import type { Match } from '@/entities/match';
import type { Gym } from '@/entities/gym';
import type { User } from '@/entities/user';
import type { Team } from '@/entities/team';
import type { MatchListItemDTO, MatchDetailDTO } from '../model/types';
import {
  formatPrice,
  formatPositions,
  formatLevelRange,
  formatAgeRange,
  formatTime,
  formatDateISO,
  isWithin24Hours,
} from './formatters';

/**
 * Match + related entities → MatchListItemDTO
 *
 * @param match - Match entity
 * @param gym - Gym entity
 * @param host - User entity (host)
 * @param team - Team entity (nullable)
 * @returns Flat DTO for list views
 */
export function toMatchListItemDTO(
  match: Match,
  gym: Gym,
  host: User,
  team: Team | null
): MatchListItemDTO {
  return {
    // Match fields
    matchId: match.id,
    dateISO: formatDateISO(match.startTime),
    startTime: formatTime(match.startTime),
    endTime: formatTime(match.endTime),
    matchType: match.matchType,
    matchFormat: match.matchFormat,
    genderRule: match.genderRule,
    status: match.status,

    // Gym fields (flattened)
    gymId: gym.id,
    gymName: gym.name,
    gymAddress: gym.address,
    gymLatitude: gym.latitude,
    gymLongitude: gym.longitude,

    // Host fields (flattened)
    hostId: host.id,
    hostNickname: host.nickname,
    hostAvatar: host.avatarUrl,

    // Team fields (flattened)
    teamId: team?.id ?? null,
    teamName: team?.name ?? match.manualTeamName,
    teamLogo: team?.logoUrl ?? null,

    // Computed UI fields
    priceDisplay: formatPrice(match.costType, match.costAmount),
    positionsDisplay: formatPositions(match.recruitmentSetup),
    levelDisplay: formatLevelRange(match.levelRange),
    ageDisplay: formatAgeRange(match.ageRange),
    isNew: isWithin24Hours(match.createdAt),
    isClosed: match.status === 'CLOSED',
  };
}

/**
 * Match + related entities → MatchDetailDTO
 *
 * @param match - Match entity
 * @param gym - Gym entity
 * @param host - User entity (host)
 * @param team - Team entity (nullable)
 * @returns Flat DTO for detail views
 */
export function toMatchDetailDTO(
  match: Match,
  gym: Gym,
  host: User,
  team: Team | null
): MatchDetailDTO {
  // Start with list item DTO
  const listItem = toMatchListItemDTO(match, gym, host, team);

  // Calculate recruitment status
  const { type, maxCount, positions } = match.recruitmentSetup;
  let total = 0;
  let current = 0;

  if (type === 'ANY' && maxCount) {
    total = maxCount.max;
    current = maxCount.current ?? 0;
  } else if (type === 'POSITION' && positions) {
    for (const pos of Object.values(positions)) {
      total += pos.max;
      current += pos.current ?? 0;
    }
  }

  const recruitmentStatus = {
    total,
    current,
    isFull: current >= total,
  };

  // Format match rule
  let matchRuleDisplay = null;
  if (match.matchRule) {
    const playStyleLabels: Record<string, string> = {
      INTERNAL_2WAY: '2파전',
      INTERNAL_3WAY: '3파전',
      EXCHANGE: '교류전',
      PRACTICE: '연습',
    };

    const refereeLabels: Record<string, string> = {
      SELF: '자체 심판',
      STAFF: '스태프',
      PRO: '전문 심판',
    };

    matchRuleDisplay = {
      playStyle: playStyleLabels[match.matchRule.play_style] ?? match.matchRule.play_style,
      quarterTime: match.matchRule.quarter_rule?.minutes_per_quarter ?? 10,
      quarterCount: match.matchRule.quarter_rule?.quarter_count ?? 4,
      referee: refereeLabels[match.matchRule.referee_type] ?? match.matchRule.referee_type,
    };
  }

  // Extract contact info
  let contactType = null;
  let contactValue = null;
  if (match.operationInfo) {
    contactType = match.operationInfo.type;
    contactValue = match.operationInfo.type === 'PHONE'
      ? match.operationInfo.phone ?? null
      : match.operationInfo.url ?? null;
  }

  return {
    ...listItem,
    requirements: match.requirements,
    providesBeverage: match.providesBeverage,
    recruitmentStatus,
    matchRuleDisplay,
    contactType,
    contactValue,
  };
}
```

**Step 2: Build verification**

Run: `npm run build`

Expected: Build succeeds, no type errors

**Step 3: Commit**

```bash
git add src/features/match/lib/mappers.ts
git commit -m "feat(match): add DTO mappers

Create Entity → DTO mappers:
- toMatchListItemDTO (Match + Gym + User + Team → ListDTO)
- toMatchDetailDTO (Match + Gym + User + Team → DetailDTO)

Mappers flatten entities and compute UI fields:
- Reuse entity mappers for type conversion
- Apply formatting utilities
- Calculate recruitment status
- Format match rule display

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 📋 Phase 2: Update List Query

### Task 2.1: Update useRecruitingMatches Query

**Files:**
- Modify: `src/features/match/api/queries.ts`

**Step 1: Add imports for DTO mapper**

Add to the imports section:

```typescript
import { toMatchListItemDTO } from '../lib/mappers';
import type { MatchListItemDTO } from '../model/types';
import { matchRowToEntity } from '@/entities/match';
import { gymRowToEntity } from '@/entities/gym';
import { userRowToEntity } from '@/entities/user';
import { teamRowToEntity } from '@/entities/team';
```

**Step 2: Update useRecruitingMatches to return DTO**

Replace the `useRecruitingMatches` function:

```typescript
/**
 * 모집중 매치 목록 조회
 * @returns MatchListItemDTO[] 형태로 변환된 매치 목록
 */
export function useRecruitingMatches() {
  return useQuery({
    queryKey: matchKeys.lists(),
    queryFn: async (): Promise<MatchListItemDTO[]> => {
      console.log('[useRecruitingMatches] Fetching matches...');
      const supabase = getSupabaseBrowserClient();

      // JOIN query (1 query instead of N)
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          gyms(*),
          users!matches_host_id_fkey(*),
          teams(*)
        `)
        .eq('match_type', 'GUEST_RECRUIT')
        .eq('status', 'RECRUITING')
        .order('start_time', { ascending: true });

      if (error) throw error;
      if (!data) return [];

      console.log('[useRecruitingMatches] Raw rows:', data);

      // Entity mappers → DTO mapper
      const dtos = data.map(row => {
        const match = matchRowToEntity(row);
        const gym = gymRowToEntity(row.gyms);
        const host = userRowToEntity(row.users);
        const team = row.teams ? teamRowToEntity(row.teams) : null;

        return toMatchListItemDTO(match, gym, host, team);
      });

      console.log('[useRecruitingMatches] Mapped DTOs:', dtos);
      return dtos;
    },
  });
}
```

**Step 3: Build verification**

Run: `npm run build`

Expected: Type errors in components using `useRecruitingMatches` (expected!)

**Step 4: Commit**

```bash
git add src/features/match/api/queries.ts
git commit -m "refactor(match): update useRecruitingMatches to return DTO

Change useRecruitingMatches query:
- Use JOIN query for performance (1 query vs N)
- Apply entity mappers (matchRowToEntity, gymRowToEntity, etc.)
- Apply DTO mapper (toMatchListItemDTO)
- Return MatchListItemDTO[]

Components will show type errors (fixed in next phase).

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 📋 Phase 3: Update List Components

### Task 3.1: Update MatchListItem Component

**Files:**
- Modify: `src/features/match/ui/match-list-item.tsx`

**Step 1: Update imports and Props type**

Replace the import and props interface:

```typescript
import { MatchListItemDTO } from '@/features/match/model/types';

interface MatchListItemProps {
  match: MatchListItemDTO; // ← Changed from GuestListMatch
  applicationStatus?: ApplicationStatusValue;
}
```

**Step 2: Update component implementation to use flat DTO**

Replace prop accesses (this will require reading the full component and updating all usages):

```typescript
// OLD (nested)
match.location.name → match.gymName
match.location.address → match.gymAddress
match.price.type → (removed, use match.priceDisplay directly)
match.positions → (removed, use match.positionsDisplay directly)
match.teamName → match.teamName (same)

// NEW (flat)
{match.gymName}
{match.gymAddress}
{match.priceDisplay}
{match.positionsDisplay}
```

**Step 3: Build verification**

Run: `npm run build`

Expected: Build succeeds, no type errors in match-list-item.tsx

**Step 4: Manual testing**

Run: `npm run dev`

Visit: `http://localhost:3000`

Expected: Match list displays correctly with all data

**Step 5: Commit**

```bash
git add src/features/match/ui/match-list-item.tsx
git commit -m "refactor(match): update MatchListItem to use DTO

Update MatchListItem component:
- Use MatchListItemDTO instead of GuestListMatch
- Flat prop access (no nested objects)
- Pre-computed UI fields (priceDisplay, positionsDisplay)

List view migration complete.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3.2: Update Other List Components

**Files:**
- Modify: Any other components using `GuestListMatch` for list views

**Step 1: Find all components using GuestListMatch**

Run:

```bash
grep -r "GuestListMatch" src/features/match/ui/ --include="*.tsx"
```

**Step 2: Update each component found**

For each file, update imports and prop accesses similar to Task 3.1

**Step 3: Build & test verification**

Run: `npm run build && npm run dev`

Expected: All list views work correctly

**Step 4: Commit**

```bash
git add src/features/match/ui/
git commit -m "refactor(match): update remaining list components to use DTO

Update all list view components to use MatchListItemDTO.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 📋 Phase 4: Update Detail Query

### Task 4.1: Update useMatch Query

**Files:**
- Modify: `src/features/match/api/queries.ts`

**Step 1: Update useMatch to return MatchDetailDTO**

Replace the `useMatch` function:

```typescript
import { toMatchDetailDTO } from '../lib/mappers';
import type { MatchDetailDTO } from '../model/types';

/**
 * 단일 매치 상세 조회
 * @param matchId 매치 ID
 * @returns MatchDetailDTO 형태로 변환된 매치 상세
 */
export function useMatch(matchId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: matchKeys.detail(matchId),
    queryFn: async (): Promise<MatchDetailDTO> => {
      const supabase = getSupabaseBrowserClient();

      // JOIN query
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          gyms(*),
          users!matches_host_id_fkey(*),
          teams(*)
        `)
        .eq('id', matchId)
        .single();

      if (error) throw error;

      // Entity mappers → DTO mapper
      const match = matchRowToEntity(data);
      const gym = gymRowToEntity(data.gyms);
      const host = userRowToEntity(data.users);
      const team = data.teams ? teamRowToEntity(data.teams) : null;

      return toMatchDetailDTO(match, gym, host, team);
    },
    // Optimistic update from list cache
    initialData: () => {
      const listData = queryClient.getQueryData<MatchListItemDTO[]>(matchKeys.lists());
      return listData?.find(m => m.matchId === matchId) as MatchDetailDTO | undefined;
    },
  });
}
```

**Step 2: Build verification**

Run: `npm run build`

Expected: Type errors in detail components (expected!)

**Step 3: Commit**

```bash
git add src/features/match/api/queries.ts
git commit -m "refactor(match): update useMatch to return DetailDTO

Change useMatch query:
- Use JOIN query for complete match data
- Apply entity + DTO mappers
- Return MatchDetailDTO
- Keep initialData optimization from list cache

Detail components will show type errors (fixed in next phase).

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 📋 Phase 5: Update Detail Components

### Task 5.1: Update MatchDetailView Component

**Files:**
- Modify: `src/features/match/ui/match-detail-view.tsx`

**Step 1: Update imports and props**

```typescript
import { MatchDetailDTO } from '@/features/match/model/types';

// Update component to use MatchDetailDTO
```

**Step 2: Update all nested prop accesses to flat structure**

Similar to list components, update all prop accesses to use flat structure.

**Step 3: Build & manual testing**

Run: `npm run build && npm run dev`

Visit: Match detail page

Expected: Detail view displays correctly

**Step 4: Commit**

```bash
git add src/features/match/ui/match-detail-view.tsx
git commit -m "refactor(match): update MatchDetailView to use DTO

Update MatchDetailView component:
- Use MatchDetailDTO instead of MatchDetailUI
- Flat prop access
- Pre-computed fields

Detail view migration complete.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 5.2: Update Detail Sub-components

**Files:**
- Modify: `src/features/match/ui/components/detail/*.tsx`

**Step 1: Update all detail sub-components**

For each sub-component that receives match data, update to use MatchDetailDTO.

**Step 2: Build & test verification**

Run: `npm run build && npm run dev`

Test all detail page features thoroughly.

**Step 3: Commit**

```bash
git add src/features/match/ui/components/detail/
git commit -m "refactor(match): update detail sub-components to use DTO

Update all detail sub-components to use MatchDetailDTO.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 📋 Phase 6: Cleanup Legacy Types

### Task 6.1: Remove Deprecated Types

**Files:**
- Modify: `src/features/match/model/types.ts`

**Step 1: Verify no legacy type usage remains**

Run grep to ensure no references:

```bash
grep -r "GuestListMatch" src/features/match/ --include="*.tsx" --include="*.ts"
grep -r "MatchDetailUI" src/features/match/ --include="*.tsx" --include="*.ts"
grep -r ": Location" src/features/match/ --include="*.tsx" --include="*.ts"
grep -r ": PriceInfo" src/features/match/ --include="*.tsx" --include="*.ts"
```

Expected: Only matches in model/types.ts (the definition itself)

**Step 2: Delete legacy type definitions**

Remove from `src/features/match/model/types.ts`:
- `GuestListMatch`
- `BaseMatch`
- `Location`
- `PriceInfo`
- `PositionStatus`
- `PositionStatusUI`
- `PositionsUI`
- `ContactInfo`
- `MatchOptionsUI`
- `MatchDetailUI`

Keep only:
- `MatchListItemDTO`
- `MatchDetailDTO`

**Step 3: Build verification**

Run: `npm run build`

Expected: Build succeeds with 0 errors

**Step 4: Final grep verification**

```bash
grep -r "GuestListMatch\|BaseMatch\|MatchDetailUI" src/features/match/
```

Expected: No matches found

**Step 5: Commit**

```bash
git add src/features/match/model/types.ts
git commit -m "refactor(match): remove legacy types

Remove deprecated types:
- GuestListMatch → MatchListItemDTO
- BaseMatch → removed (unused)
- Location → flattened into DTO
- PriceInfo → computed field (priceDisplay)
- PositionStatusUI, PositionsUI → computed field (positionsDisplay)
- MatchDetailUI → MatchDetailDTO

Migration to FSD-compliant Flat DTOs complete.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 6.2: Remove Unused Mapper Functions

**Files:**
- Modify: `src/features/match/api/match-mapper.ts`

**Step 1: Check if match-mapper.ts is still needed**

If `matchRowToGuestListMatch` is no longer used (replaced by entity mappers + DTO mappers), this file can be deleted.

Run:

```bash
grep -r "matchRowToGuestListMatch" src/ --include="*.ts" --include="*.tsx"
```

**Step 2: Delete if unused**

If no references found:

```bash
git rm src/features/match/api/match-mapper.ts
```

**Step 3: Build verification**

Run: `npm run build`

Expected: Build succeeds

**Step 4: Commit**

```bash
git commit -m "refactor(match): remove legacy mapper

Remove matchRowToGuestListMatch mapper:
- Replaced by entity mappers + DTO mappers
- No longer referenced

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## ✅ Verification Checklist

After completing all tasks, verify:

- [ ] `npm run build` succeeds with 0 errors
- [ ] `npm run dev` works, app is functional
- [ ] Match list view displays correctly
- [ ] Match detail view displays correctly
- [ ] No references to legacy types:
  - [ ] `grep -r "GuestListMatch" src/features/match/`
  - [ ] `grep -r "BaseMatch" src/features/match/`
  - [ ] `grep -r "MatchDetailUI" src/features/match/`
  - [ ] `grep -r "Location" src/features/match/` (type usage)
- [ ] All components use flat DTO props
- [ ] 6 commits created with clear messages

---

## 🎯 Expected Outcome

**Files Created:**
- `src/features/match/lib/formatters.ts` (~180 lines)
- `src/features/match/lib/mappers.ts` (~150 lines)

**Files Modified:**
- `src/features/match/model/types.ts` (234 → 80 lines, ~150 lines removed)
- `src/features/match/api/queries.ts` (updated to use DTOs)
- `src/features/match/ui/match-list-item.tsx` (flat props)
- `src/features/match/ui/match-detail-view.tsx` (flat props)
- `src/features/match/ui/components/detail/*.tsx` (flat props)

**Files Deleted:**
- `src/features/match/api/match-mapper.ts` (replaced by lib/mappers.ts)

**Benefits Achieved:**
- ✅ FSD compliance (100%)
- ✅ Flat DTO pattern (React best practice)
- ✅ Performance (1 JOIN query vs N queries)
- ✅ Type safety (clear Entity vs DTO boundaries)
- ✅ Pattern established (template for team/application features)

---

**Last Updated**: 2026-02-14
**Estimated Time**: 2-3 hours
**Total Commits**: 6
