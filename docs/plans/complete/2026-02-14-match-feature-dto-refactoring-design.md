# Match Feature UI Types Refactoring Design

**Date**: 2026-02-14
**Status**: ✅ Completed (Implementation finished)
**Completed**: 2026-02-14

---

## 🎯 Overview

**Goal**: Refactor `features/match` UI types to use **Flat DTOs** following FSD + React best practices, establishing a pattern for all features.

**Scope**: Match feature only (template for future team/application refactoring)

**Approach**: Incremental migration (6 phases, ~2.5 hours)

---

## 🏗️ Architecture

### Layer Responsibilities

```
┌─────────────────────────────────────────────────────────┐
│ app/                                                     │
│ └── page.tsx (uses features/match)                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ features/match/                                          │
│ ├── model/types.ts        ← DTO types (UI models)       │
│ ├── lib/mappers.ts        ← Entity → DTO conversion     │
│ ├── api/queries.ts        ← React Query hooks           │
│ └── ui/components/        ← React components            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ entities/                 ← Pure domain models          │
│ ├── match/model/types.ts  ← Match entity (DB schema)    │
│ ├── gym/model/types.ts    ← Gym entity                  │
│ ├── user/model/types.ts   ← User entity                 │
│ └── team/model/types.ts   ← Team entity                 │
└─────────────────────────────────────────────────────────┘
```

**Principles:**
- ✅ **Entities**: Pure domain models (ID references only, no nested objects)
- ✅ **Features**: DTO types for UI, JOIN queries, entity composition
- ✅ **DTOs**: Flat structure (React-friendly, easy memoization)

---

## 📦 Type Structure

### Core DTO Types

#### MatchListItemDTO (리스트용)

```typescript
export interface MatchListItemDTO {
  // Match entity fields
  matchId: string;
  dateISO: string;                    // "2026-02-14"
  startTime: string;                  // "19:00"
  endTime: string;                    // "21:00"
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
  priceDisplay: string;               // "10,000원" | "무료"
  positionsDisplay: string;           // "가드 1/3, 포워드 0/2"
  levelDisplay: string | null;        // "중수(B) 이상"
  ageDisplay: string | null;          // "20대~30대"
  isNew: boolean;                     // Created within 24h
  isClosed: boolean;                  // status === 'CLOSED'
}
```

#### MatchDetailDTO (상세용)

```typescript
export interface MatchDetailDTO extends MatchListItemDTO {
  // Additional detail fields
  requirements: string[] | null;
  providesBeverage: boolean | null;

  recruitmentStatus: {
    total: number;
    current: number;
    isFull: boolean;
  };

  matchRuleDisplay: {
    playStyle: string;                // "2파전" | "3파전"
    quarterTime: number;
    quarterCount: number;
    referee: string;                  // "자체 심판" | "전문 심판"
  } | null;

  contactType: ContactTypeValue | null;
  contactValue: string | null;
}
```

### No Re-exports

Components use DTOs directly. Entity types imported only in mappers when needed.

```typescript
// ❌ NO re-exports from entities
// export type { Match } from '@/entities/match';

// ✅ Only feature DTO types
export interface MatchListItemDTO { /* ... */ }
export interface MatchDetailDTO { /* ... */ }
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Database (Supabase)                                   │
│    matches JOIN gyms JOIN users JOIN teams              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Features Query (features/match/api/queries.ts)       │
│    - Execute JOIN query                                  │
│    - Get raw DB rows                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Entity Mappers (entities/*/api/mapper.ts)            │
│    - matchRowToEntity(data)         → Match            │
│    - gymRowToEntity(data.gyms)      → Gym              │
│    - userRowToEntity(data.users)    → User             │
│    - teamRowToEntity(data.teams)    → Team | null      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. DTO Mapper (features/match/lib/mappers.ts)           │
│    - toMatchListItemDTO(match, gym, host, team)        │
│    - Flatten entities into flat DTO                     │
│    - Compute UI fields (priceDisplay, etc.)            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. React Component (features/match/ui/)                 │
│    - Receives MatchListItemDTO                          │
│    - Renders UI with flat props                         │
└─────────────────────────────────────────────────────────┘
```

### Code Example

```typescript
// features/match/api/queries.ts
export function useMatches() {
  return useQuery({
    queryKey: ['matches', 'list'],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      // JOIN query (1 query instead of N)
      const { data } = await supabase
        .from('matches')
        .select(`*, gyms(*), users!matches_host_id_fkey(*), teams(*)`)
        .eq('match_type', 'GUEST_RECRUIT');

      // Entity mappers → DTO mapper
      return data.map(row => {
        const match = matchRowToEntity(row);
        const gym = gymRowToEntity(row.gyms);
        const host = userRowToEntity(row.users);
        const team = row.teams ? teamRowToEntity(row.teams) : null;

        return toMatchListItemDTO(match, gym, host, team);
      });
    }
  });
}
```

---

## 🚀 Incremental Migration Strategy

### 6 Phases (~2.5 hours)

#### Phase 1: Foundation (30min)
- **Create**: `features/match/lib/mappers.ts`, `formatters.ts`
- **Update**: `features/match/model/types.ts` (add DTOs, keep legacy)
- **Verification**: Build succeeds, no breaking changes
- **Commit**: "feat(match): add DTO types and mappers"

#### Phase 2: Update List Query (15min)
- **Update**: `useMatches` to return `MatchListItemDTO`
- **Verification**: Build succeeds, type errors in components (expected)
- **Commit**: "refactor(match): update useMatches to return DTO"

#### Phase 3: Update List Components (30min)
- **Update**: `MatchCard`, list views to use `MatchListItemDTO`
- **Verification**: Build succeeds, app works, manual testing
- **Commit**: "refactor(match): update list components to use DTO"

#### Phase 4: Update Detail Query (15min)
- **Update**: `useMatchDetail` to return `MatchDetailDTO`
- **Verification**: Build succeeds, type errors in components (expected)
- **Commit**: "refactor(match): update useMatchDetail to return DTO"

#### Phase 5: Update Detail Components (30min)
- **Update**: `MatchDetailView`, detail pages to use `MatchDetailDTO`
- **Verification**: Build succeeds, app works, manual testing
- **Commit**: "refactor(match): update detail components to use DTO"

#### Phase 6: Cleanup Legacy Types (15min)
- **Delete**: `GuestListMatch`, `BaseMatch`, `Location`, `PriceInfo`, etc.
- **Verification**: Build succeeds, grep for legacy types returns nothing
- **Commit**: "refactor(match): remove legacy types"

---

## 📁 File Structure

### Files to Create

```
src/features/match/
├── lib/
│   ├── mappers.ts            ✅ CREATE (Entity → DTO)
│   └── formatters.ts         ✅ CREATE (UI utilities)
```

### Files to Modify

```
src/features/match/
├── model/
│   └── types.ts              ✏️ ADD DTO types, mark legacy deprecated
│
├── api/
│   └── queries.ts            ✏️ Use DTO mappers
│
└── ui/
    ├── match-card.tsx        ✏️ Use MatchListItemDTO
    └── match-detail-view.tsx ✏️ Use MatchDetailDTO
```

### Mapper Location Strategy

**Split by responsibility:**

```
api/match-mapper.ts  → DB row → Entity  (data layer)
lib/mappers.ts       → Entity → DTO     (UI layer)
```

---

## ✅ Key Decisions

### Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **DTO Pattern** | Flat DTOs | React best practice, easier memoization |
| **JOIN Location** | Features layer | Performance (1 query vs N), FSD compliant |
| **Mapper Split** | `api/` + `lib/` | DB layer vs UI layer separation |
| **Re-export** | No re-export | Components use DTOs only |
| **Migration** | Incremental | Safe, testable, no downtime |

### FSD Compliance

**Entities:**
- ✅ Pure domain models (DB schema)
- ✅ ID references only (no nested objects)
- ✅ Independent (no cross-entity dependencies)

**Features:**
- ✅ DTO types for UI consumption
- ✅ JOIN queries (orchestrate multiple entities)
- ✅ Flat structure (React-friendly)
- ✅ Reuse entity mappers for type conversion

### React Best Practices

**Flat Props:**
```typescript
// ❌ Nested (hard to optimize)
<MatchCard match={{ location: { name: "..." } }} />

// ✅ Flat (easy to memoize)
<MatchCard gymName="..." gymAddress="..." />
```

**Benefits:**
- ✅ Easy `React.memo` optimization
- ✅ Clear prop dependencies
- ✅ Better debugging in DevTools

---

## 🎉 Expected Outcomes

### Before
```
features/match/model/types.ts (234 lines)
├─ BaseMatch ❌ (domain entity)
├─ Location ❌ (shared type)
├─ PriceInfo ❌ (shared type)
└─ GuestListMatch ❌ (nested structure)
```

### After
```
features/match/model/types.ts (80 lines)
├─ MatchListItemDTO ✅ (flat DTO)
└─ MatchDetailDTO ✅ (flat DTO)

features/match/lib/mappers.ts (60 lines)
├─ toMatchListItemDTO ✅
└─ toMatchDetailDTO ✅

features/match/lib/formatters.ts (40 lines)
├─ formatPrice ✅
├─ formatPositions ✅
└─ formatLevel ✅
```

**Benefits:**
- ✅ ~100 lines removed (via deduplication)
- ✅ Clear boundaries (entity vs DTO)
- ✅ FSD compliance (100%)
- ✅ React-friendly (flat props)
- ✅ Performance (1 JOIN query vs N queries)
- ✅ Pattern established for other features

---

## 📚 References

- **FSD Official Docs**: [feature-sliced.design](https://feature-sliced.design/)
- **React Best Practices**: [Flat Props Pattern](https://react.dev/learn/passing-props-to-a-component)
- **Project Context**: [CLAUDE.md](../../CLAUDE.md)
- **Phase 3 Plan**: [phase3-remove-cross-imports.md](./2026-02-14-phase3-remove-cross-imports.md)

---

**Last Updated**: 2026-02-14
**Approved By**: User
**Next Step**: Create implementation plan via `writing-plans` skill
