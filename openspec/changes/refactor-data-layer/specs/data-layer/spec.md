# Data Layer Specification

## ADDED Requirements

### Requirement: Type Location Rules
The system SHALL define clear rules for where each type of interface is defined:

- **Layer 1 (database.types.ts)**: Supabase auto-generated Row/Insert/Update types
- **Layer 1.5 (jsonb.types.ts)**: JSONB field interface definitions
- **Layer 2 (constants.ts)**: Enum values, labels, styles, and options
- **Layer 3 (features/*/model/types.ts)**: Feature-specific UI types that extend DB types

#### Scenario: Finding a type location
- **WHEN** a developer asks "where should I define Match status enum?"
- **THEN** the answer is unambiguous: "constants.ts for values/labels, database.types.ts for the enum type alias"

#### Scenario: Adding a new JSONB field
- **WHEN** a new JSONB structure is needed (e.g., payment_info)
- **THEN** the interface MUST be added to jsonb.types.ts
- **AND** the interface MUST be imported in database.types.ts for the column type

### Requirement: JSONB Interface Unification
The system SHALL use unified JSONB field names across all tables:

**Unified fields (same name, same structure):**
- `operation_info` → `OperationInfo`: type, url, notice (users, teams, matches)
- `account_info` → `AccountInfo`: bank, number, holder (users, teams, matches)

**Table-specific fields:**
- `recruitment_setup` → `RecruitmentSetup`: type, max_count, positions (matches)
- `match_rule` → `MatchRule`: play_style, quarter_rule, referee_type (matches)
- `recruitment_count` → `RecruitmentCount`: position counts (matches)
- `facilities` → `GymFacilities`: shower, parking, etc. (gyms)
- `participants` → `Participant[]`: type, name, position, cost (applications)
- `regular_schedules` → `RegularSchedule[]`: day, times (teams)
- `requirements` → `Requirements`: items, custom (matches)

#### Scenario: Using operation info
- **WHEN** any table stores contact/operation information
- **THEN** it MUST use the `operation_info` JSONB column
- **AND** the column MUST conform to the `OperationInfo` interface
- **AND** accessing notice uses `entity.operation_info.notice`

#### Scenario: Using account info
- **WHEN** any table stores account information
- **THEN** it MUST use the `account_info` JSONB column
- **AND** the column MUST conform to the `AccountInfo` interface

### Requirement: Enum Value Consistency
The system SHALL use identical enum values between database and client code:

- All enum values MUST use UPPER_SNAKE_CASE
- DB values and TypeScript values MUST be identical
- UI labels MUST be retrieved from constants.ts LABELS maps

#### Scenario: Gender enum usage
- **WHEN** a gender value is stored in DB
- **THEN** it MUST be one of: 'MALE', 'FEMALE', 'MIXED'
- **AND** the same value MUST be used in client code
- **AND** UI display MUST use `GENDER_LABELS[value]`

### Requirement: Import Path Convention
The system SHALL enforce consistent import paths:

- DB types: `import type { User } from '@/shared/types/database.types'`
- JSONB types: `import type { OperationInfo } from '@/shared/types/jsonb.types'`
- Constants: `import { GENDER_LABELS } from '@/shared/config/constants'`
- Feature types: `import type { MatchCardData } from '@/features/match/model/types'`

#### Scenario: Importing match types
- **WHEN** a component needs Match DB type
- **THEN** it MUST import from `@/shared/types/database.types`
- **WHEN** a component needs Match UI-specific type
- **THEN** it MUST import from `@/features/match/model/types`

### Requirement: Field Naming Convention
The system SHALL follow consistent field naming between DB and client:

- DB uses `snake_case` (e.g., `operation_info`, `match_rule`)
- Client uses `camelCase` (e.g., `operationInfo`, `matchRule`)
- Enum values are NOT converted (e.g., 'MALE' stays 'MALE')

#### Scenario: Accessing match rule in UI
- **WHEN** UI component accesses match rule data
- **THEN** it uses `match.matchRule.playStyle` (camelCase)
- **AND** mapper converts from `match_rule.play_style` (snake_case)

## MODIFIED Requirements

### Requirement: Feature Type Definition
Feature types SHALL extend or pick from DB types rather than redefining them:

```typescript
// ✅ Correct: Extend DB type
import type { Match } from '@/shared/types/database.types';

export interface MatchCardData extends Pick<Match, 'id' | 'start_time' | 'end_time'> {
  displayTime: string; // derived field
}

// ❌ Wrong: Redefine fields
export interface MatchCardData {
  id: string;
  startTime: string; // duplicates DB type
}
```

#### Scenario: Creating a feature-specific type
- **WHEN** a feature needs a subset of DB fields plus derived fields
- **THEN** it MUST use Pick/Omit/Extend from the DB type
- **AND** it MUST NOT redefine DB fields with different names/types

### Requirement: Application Status Enum
The Application status enum SHALL use the new values:

- `PENDING`: 승인 대기
- `PAYMENT_PENDING`: 입금 대기 (호스트 승인 완료)
- `CONFIRMED`: 참여 확정 (입금 확인 완료)
- `REJECTED`: 거절됨
- `LATE`: 늦참 (확정 상태)
- `NOT_ATTENDING`: 불참 (확정 후 못 가게 됨)

Note: `CANCELED` status is removed. Cancellations should either delete the row or use `NOT_ATTENDING`.

#### Scenario: User cancels application
- **WHEN** a user cancels their application before confirmation
- **THEN** the application row SHOULD be deleted
- **OR** status MAY be set to `NOT_ATTENDING` for record keeping

### Requirement: Match Field Consolidation
The system SHALL consolidate scattered match fields into JSONB structures:

**Current (scattered fields):**
```
contact_type        → 'PHONE' | 'KAKAO_OPEN_CHAT'
contact_content     → URL or phone number
host_notice         → Notice text

account_bank        → Bank name
account_number      → Account number
account_holder      → Account holder name

match_options       → { play_style, quarter_rule, ... }
```

**New (consolidated JSONB):**
```
operation_info: {
  type: 'PHONE' | 'KAKAO_OPEN_CHAT',
  url?: string,       // Open chat URL when type is KAKAO_OPEN_CHAT
  notice?: string     // Host notice
}

account_info: {
  bank?: string,
  number?: string,
  holder?: string
}

match_rule: {         // Renamed from match_options
  play_style?: 'INTERNAL_2WAY' | 'INTERNAL_3WAY' | 'EXCHANGE',
  quarter_rule?: {
    minutes_per_quarter: number,
    quarter_count: number,
    game_count: number
  },
  guaranteed_quarters?: number,
  referee_type?: 'SELF' | 'STAFF' | 'PRO'
}
```

#### Scenario: Creating a match (mapper transformation)
- **WHEN** match create form is submitted
- **THEN** mapper transforms:
  - `form.contactType` + `form.contactContent` + `form.notice` → `operation_info`
  - `form.bank` + `form.accountNumber` + `form.accountHolder` → `account_info`
  - `form.gameFormat` + `form.rules.*` → `match_rule`

#### Scenario: Displaying match detail (mapper transformation)
- **WHEN** match detail is fetched
- **THEN** mapper transforms:
  - `match.operation_info.notice` → `hostNotice` (or `operationInfo.notice`)
  - `match.match_rule.play_style` → `matchRule.playStyle`

## REMOVED Requirements

### Requirement: Separate Match Type Files
**Reason**: Consolidating match types to follow SSOT principle

**Migration:**
- `MatchType`, `MatchStatus`, `ApplicantStatus` enums → `constants.ts`
- `MatchOptionsUI` → `jsonb.types.ts` as `MatchRule`
- `Location`, `PriceInfo`, `PositionStatus`, `BaseMatch`, `GuestListMatch` → `features/match/model/types.ts`
- `Applicant` → `features/application/model/types.ts`
- `Team` → `features/team/model/types.ts`
- Delete `shared/types/match.ts`

#### Scenario: Migrating existing imports
- **WHEN** code imports from `@/shared/types/match`
- **THEN** imports MUST be updated to the new locations per the migration table above
