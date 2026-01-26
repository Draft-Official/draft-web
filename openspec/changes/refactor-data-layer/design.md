# Design: Data Layer Architecture - Type Location & Responsibility Rules

## Context

현재 프로젝트에서 데이터 타입이 여러 레이어에 분산되어 있어 "이 타입은 어디에 있지?"라는 질문에 명확히 답하기 어렵습니다. 이 문서는 **명확한 규칙**을 정립하여 모든 타입의 위치와 역할을 예측 가능하게 만듭니다.

## Goals / Non-Goals

### Goals
- **SSOT 구현**: 각 타입이 정확히 한 곳에만 정의됨
- **명확한 규칙**: "이 타입은 어디에?"에 즉답 가능
- **타입 안전성**: DB enum을 TypeScript에서 안전하게 사용

### Non-Goals
- 기존 코드 100% 호환 유지 (Breaking change 허용)

---

## Rule 1: 타입 레이어 분리

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 0: Database (Supabase PostgreSQL)                     │
│ - Source of truth for schema                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: shared/types/database.types.ts                     │
│ - Supabase CLI 자동 생성                                    │
│ - Row, Insert, Update 타입                                  │
│ - ⚠️ 수동 수정 금지                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 1.5: shared/types/jsonb.types.ts                      │
│ - JSONB 필드의 TypeScript 인터페이스                        │
│ - database.types.ts에서 import하여 사용                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: shared/config/constants.ts                         │
│ - Enum 값 (VALUES)                                          │
│ - UI 라벨 (LABELS)                                          │
│ - 스타일 (STYLES)                                           │
│ - 폼 옵션 (OPTIONS)                                         │
│ - 기본값 (DEFAULTS)                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: features/{feature}/model/types.ts                  │
│ - UI 컴포넌트 전용 타입                                     │
│ - DB 타입을 Pick/Omit/Extend하여 사용                       │
│ - ⚠️ DB 필드 재정의 금지                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Rule 2: 파일별 책임

| 파일 | 정의하는 것 | 정의하지 않는 것 |
|------|------------|-----------------|
| `database.types.ts` | DB Row 타입, Enum 타입 | UI 전용 필드, 라벨 |
| `jsonb.types.ts` | JSONB 구조 인터페이스 | 값, 라벨 |
| `constants.ts` | Enum 값, 라벨, 스타일, 옵션 | 타입 정의 |
| `features/*/model/types.ts` | UI 전용 타입 (extends DB) | DB 필드 재정의 |
| `features/*/model/schema.ts` | Zod validation schema | 타입 정의 |

---

## Rule 3: JSONB 필드 통일

**모든 테이블에서 동일한 구조는 동일한 이름 사용:**

```typescript
// shared/types/jsonb.types.ts

/** 운영 정보 - 모든 테이블에서 동일한 이름 사용 */
export interface OperationInfo {
  type: 'PHONE' | 'KAKAO_OPEN_CHAT';
  url?: string;      // 오픈채팅 URL
  notice?: string;   // 공지사항
}

/** 계좌 정보 - 모든 테이블에서 동일한 이름 사용 */
export interface AccountInfo {
  bank?: string;
  number?: string;
  holder?: string;
}
```

**적용:**
```sql
users.operation_info     -- OperationInfo
users.account_info       -- AccountInfo
teams.operation_info     -- OperationInfo
teams.account_info       -- AccountInfo
matches.operation_info   -- OperationInfo
matches.account_info     -- AccountInfo
```

---

## Rule 4: 필드 네이밍 규칙

### 4.1 DB ↔ Client 변환

| 규칙 | DB (snake_case) | Client (camelCase) |
|------|-----------------|-------------------|
| 자동 변환 | `operation_info` | `operationInfo` |
| 자동 변환 | `match_rule` | `matchRule` |
| 자동 변환 | `recruitment_count` | `recruitmentCount` |

### 4.2 Enum 값은 변환하지 않음

```typescript
// ❌ 잘못된 패턴
DB: 'MALE' → Client: 'men'
DB: 'INTERNAL_2WAY' → Client: '2team'

// ✅ 올바른 패턴
DB: 'MALE' → Client: 'MALE'
DB: 'INTERNAL_2WAY' → Client: 'INTERNAL_2WAY'
```

### 4.3 UI 표시는 LABELS 사용

```typescript
// ❌ 컴포넌트에서 직접 매핑
const label = gender === 'MALE' ? '남성' : '여성';

// ✅ constants에서 가져오기
import { GENDER_LABELS } from '@/shared/config/constants';
const label = GENDER_LABELS[gender];
```

---

## Rule 5: Import 패턴

```typescript
// ✅ 올바른 패턴

// DB 타입
import type { User, Match } from '@/shared/types/database.types';

// JSONB 타입
import type { OperationInfo, AccountInfo } from '@/shared/types/jsonb.types';

// 상수 & 라벨
import { GENDER_LABELS, GENDER_OPTIONS } from '@/shared/config/constants';
import type { GenderValue } from '@/shared/config/constants';

// Feature 타입
import type { MatchCardData } from '@/features/match/model/types';
```

```typescript
// ❌ 잘못된 패턴

// shared/types/match.ts 사용 (삭제 예정)
import { MatchStatus } from '@/shared/types/match';

// feature에서 DB 필드 재정의
export interface Match {
  id: string;  // database.types에서 이미 정의됨
}
```

---

## Rule 6: Feature 타입 작성법

```typescript
// features/match/model/types.ts

import type { Match } from '@/shared/types/database.types';
import type { OperationInfo, MatchRule } from '@/shared/types/jsonb.types';

// ✅ DB 타입 확장
export interface MatchCardData extends Pick<Match, 'id' | 'start_time' | 'end_time'> {
  displayTime: string;  // UI 전용 파생 필드
  isToday: boolean;     // UI 전용 계산 필드
}

// ✅ DB 타입 조합
export interface MatchDetailData extends Match {
  gym: Gym | null;      // 조인된 데이터
  host: User;           // 조인된 데이터
}

// ❌ 잘못된 패턴 - DB 필드 재정의
export interface MatchCardData {
  id: string;           // Match에서 이미 정의됨
  startTime: string;    // 이름도 다름 (start_time)
}
```

---

## JSONB 타입 전체 정의

```typescript
// shared/types/jsonb.types.ts

import type { PositionValue, PlayStyleValue, RefereeTypeValue, CourtSizeValue, RequirementsValue } from '@/shared/config/constants';

/** 운영 정보 (users, teams, matches 공통) */
export interface OperationInfo {
  type: 'PHONE' | 'KAKAO_OPEN_CHAT';
  url?: string;
  notice?: string;
}

/** 계좌 정보 (users, teams, matches 공통) */
export interface AccountInfo {
  bank?: string;
  number?: string;
  holder?: string;
}

/** 모집 설정 (matches) */
export interface RecruitmentSetup {
  type: 'ANY' | 'POSITION';
  max_count?: number;
  positions?: {
    [key in PositionValue]?: { max: number; current: number };
  };
}

/** 경기 규칙 (matches.match_rule) */
export interface MatchRule {
  play_style?: PlayStyleValue;
  quarter_rule?: {
    minutes_per_quarter: number;
    quarter_count: number;
    game_count: number;
  };
  guaranteed_quarters?: number;
  referee_type?: RefereeTypeValue;
}

/** 모집 현황 (matches.recruitment_count) */
export interface RecruitmentCount {
  [position: string]: number;
}

/** 체육관 시설 (gyms.facilities) */
export interface GymFacilities {
  shower?: boolean;
  parking?: boolean;
  parking_fee?: string;
  parking_location?: string;
  court_size_type?: CourtSizeValue;
  air_conditioner?: boolean;
  water_purifier?: boolean;
  ball?: boolean;
}

/** 참여자 정보 (applications.participants) */
export interface Participant {
  type: 'MAIN' | 'GUEST';
  name: string;
  position: PositionValue;
  cost: number;
}

/** 정기 일정 (teams.regular_schedules) */
export interface RegularSchedule {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  start_time: string;  // HH:mm
  end_time: string;    // HH:mm
  location?: string;
}

/** 준비물 (matches.requirements) */
export interface Requirements {
  items: RequirementsValue[];
  custom?: string[];
}
```

---

## Migration Plan

### Phase 1: Type Foundation (DB 변경 없이)
1. `shared/types/jsonb.types.ts` 생성
2. `shared/config/constants.ts` 통합
3. `database.types.ts` 새 구조 반영

### Phase 2: Mapper & API Layer
1. Mapper 함수 새 타입 사용
2. 필드명 변환 로직 업데이트

### Phase 3: UI Components
1. Match Create UI
2. Match Detail UI
3. Auth/Profile UI

### Phase 4: Database Migration
1. 스키마 변경 SQL
2. 데이터 마이그레이션
3. 하위 호환 코드 제거

---

## Open Questions

1. **Supabase CLI 자동 생성**: 언제 실행? JSONB 타입은 별도 파일로 유지?
2. **CANCELED → NOT_ATTENDING**: 기존 데이터 마이그레이션 방식?
3. **team_id 삭제**: 팀 단위 신청 향후 지원 방식?
