# Design: Split match_type into Type and Format

## Context

### 현재 상태 (Before)

```
matches 테이블
├── match_type: TEXT  ← '5vs5', '3vs3' (경기 방식이 저장됨)
└── (경기 목적 정보 없음)

constants.ts
├── MATCH_TYPE_VALUES = ['5vs5', '3vs3']        ← 경기 방식
├── MATCH_CATEGORY_VALUES = ['GUEST_RECRUIT'...]  ← 경기 목적 (미사용)
```

### 문제점

1. **용어 혼란**: `match_type`이라는 이름에 '경기 방식(format)'이 저장됨
2. **확장성 제한**: 향후 다른 경기 목적(픽업게임, 레슨 등) 추가 시 구분 불가
3. **코드 불일치**:
   - `app/matches/[id]/page.tsx`에서는 `matchType`을 'GUEST_RECRUIT'으로 사용
   - `match-mapper.ts`에서는 `matchType`을 '5vs5'로 사용

## Design Decision

### 목표 상태 (After)

```
matches 테이블
├── match_type: TEXT    ← 'GUEST_RECRUIT', 'PICKUP_GAME'... (경기 목적)
└── match_format: TEXT  ← 'FIVE_ON_FIVE', 'THREE_ON_THREE' (경기 방식)

constants.ts
├── MATCH_TYPE_VALUES = ['GUEST_RECRUIT', 'PICKUP_GAME'...]  ← 경기 목적
├── MATCH_FORMAT_VALUES = ['FIVE_ON_FIVE', 'THREE_ON_THREE'] ← 경기 방식
└── (MATCH_CATEGORY 삭제 - MATCH_TYPE으로 통합)
```

### 네이밍 컨벤션

| 개념 | DB 컬럼 | Constants | Client Type |
|------|---------|-----------|-------------|
| 경기 목적 | `match_type` | `MATCH_TYPE_*` | `matchType` |
| 경기 방식 | `match_format` | `MATCH_FORMAT_*` | `matchFormat` |

### 값 변환 규칙

**경기 방식 (match_format):**
| 기존 값 | 신규 값 | UI 라벨 |
|---------|---------|---------|
| '5vs5' | 'FIVE_ON_FIVE' | '5vs5' |
| '3vs3' | 'THREE_ON_THREE' | '3vs3' |

**경기 목적 (match_type):**
| 값 | UI 라벨 |
|----|---------|
| 'GUEST_RECRUIT' | '용병 모집' |
| 'PICKUP_GAME' | '픽업 게임' |
| 'TUTORIAL' | '튜토리얼' |
| 'LESSON' | '레슨' |
| 'TOURNAMENT' | '토너먼트' |

## Data Flow

### Match Creation Flow

```
[UI Form]
    ↓ matchFormat: 'FIVE_ON_FIVE'
[match-create-mapper.ts]
    ↓ { match_type: 'GUEST_RECRUIT', match_format: 'FIVE_ON_FIVE' }
[Supabase INSERT]
    ↓
[matches 테이블]
```

### Match Display Flow

```
[matches 테이블]
    ↓ { match_type: 'GUEST_RECRUIT', match_format: 'FIVE_ON_FIVE' }
[match-mapper.ts]
    ↓ { matchType: 'GUEST_RECRUIT', matchFormat: 'FIVE_ON_FIVE' }
[UI Component]
    ↓ MATCH_FORMAT_LABELS['FIVE_ON_FIVE'] → '5vs5'
[화면 표시]
```

## Alternatives Considered

### Option A: match_format만 추가 (선택됨)
- match_type 컬럼명 유지, 의미만 변경
- match_format 신규 컬럼 추가
- **장점**: 최소한의 스키마 변경
- **단점**: match_type 값 마이그레이션 필요

### Option B: 두 컬럼 모두 새로 생성
- match_purpose (경기 목적) 신규
- match_format (경기 방식) 신규
- match_type deprecated
- **장점**: 명확한 네이밍
- **단점**: 더 많은 코드 변경, 레거시 컬럼 관리

### Option C: JSONB로 통합
- match_info: { type: 'GUEST_RECRUIT', format: 'FIVE_ON_FIVE' }
- **장점**: 확장성
- **단점**: 인덱싱/쿼리 복잡, 기존 패턴과 불일치

## Migration Safety

### Rollback Plan

```sql
-- Phase 1 롤백 (match_format 제거)
ALTER TABLE matches DROP COLUMN match_format;

-- match_type 값 복원 (백업 필요)
UPDATE matches SET match_type = <backup_value>;
```

### Backward Compatibility

- `match_format`에 DEFAULT 값 설정으로 기존 INSERT 쿼리 호환
- 코드 변경은 atomic하게 진행 (한 번에 배포)
