# Change: Split match_type into Type and Format

## Why

현재 `matches.match_type` 컬럼에 '5vs5', '3vs3' 같은 **경기 방식(Format)** 정보가 저장되어 있습니다.
하지만 비즈니스적으로 **경기 목적(Type)**과 **경기 방식(Format)**은 별개의 개념입니다:

- **경기 목적 (match_type)**: GUEST_RECRUIT(용병 모집), PICKUP_GAME(픽업게임), TUTORIAL, LESSON, TOURNAMENT
- **경기 방식 (match_format)**: FIVE_ON_FIVE(5vs5), THREE_ON_THREE(3vs3)

현재 코드베이스에서도 이 혼동이 발생하고 있습니다:
- `app/matches/[id]/page.tsx`에서 `matchType: MatchType`을 'GUEST_RECRUIT' 등으로 사용
- `match-mapper.ts`에서 `matchType: row.match_type || '5vs5'`로 경기 방식을 반환
- `constants.ts`에서 `MATCH_TYPE_VALUES = ['5vs5', '3vs3']`로 정의

이 마이그레이션은 v21 스키마 정규화의 일환으로, 두 개념을 명확히 분리합니다.

## What Changes

### 1. DB 스키마 변경

**새 컬럼 추가:**
```sql
ALTER TABLE matches ADD COLUMN match_format TEXT NOT NULL DEFAULT 'FIVE_ON_FIVE';
```

**기존 데이터 마이그레이션:**
```sql
-- 기존 match_type 값을 match_format으로 변환
UPDATE matches SET match_format =
  CASE match_type
    WHEN '5vs5' THEN 'FIVE_ON_FIVE'
    WHEN '3vs3' THEN 'THREE_ON_THREE'
    ELSE 'FIVE_ON_FIVE'
  END;
```

**match_type 컬럼 변환:**
```sql
-- 기존 match_type을 경기 목적으로 변경 (기본값: GUEST_RECRUIT)
UPDATE matches SET match_type = 'GUEST_RECRUIT';
```

### 2. Constants 업데이트

```typescript
// 기존: MATCH_TYPE (경기 인원) → 이름 변경: MATCH_FORMAT
export const MATCH_FORMAT_VALUES = ['FIVE_ON_FIVE', 'THREE_ON_THREE'] as const;
export type MatchFormatValue = typeof MATCH_FORMAT_VALUES[number];

export const MATCH_FORMAT_LABELS: Record<MatchFormatValue, string> = {
  FIVE_ON_FIVE: '5vs5',
  THREE_ON_THREE: '3vs3',
};

// 기존: MATCH_CATEGORY → 이름 변경: MATCH_TYPE (경기 목적)
export const MATCH_TYPE_VALUES = ['GUEST_RECRUIT', 'PICKUP_GAME', 'TUTORIAL', 'LESSON', 'TOURNAMENT'] as const;
export type MatchTypeValue = typeof MATCH_TYPE_VALUES[number];
```

### 3. 코드 업데이트

| 파일 | 변경 내용 |
|------|----------|
| `database.types.ts` | `match_format` 컬럼 추가, `match_type` 타입 유지 |
| `constants.ts` | `MATCH_TYPE` → 경기 목적, `MATCH_FORMAT` → 경기 방식 |
| `match-mapper.ts` | `matchType` → `match_type`, `gameFormat` → `match_format` 매핑 |
| `match-create-mapper.ts` | form.matchType → `match_format` 변환 |
| `match-create-view.tsx` | state 변수명 `matchType` → `matchFormat` |
| `match-create-specs.tsx` | props 변수명 변경 |
| `schema.ts` | zod 스키마 필드명/값 변경 |
| `types.ts` | `ClientMatch.matchType`, `gameFormat` → 정리 |

## Migration Strategy

### Phase 1: DB 스키마 (Supabase 수동)
1. `match_format` 컬럼 추가 (DEFAULT 'FIVE_ON_FIVE')
2. 기존 데이터 마이그레이션 (match_type → match_format 값 변환)
3. match_type 값을 'GUEST_RECRUIT'으로 초기화

### Phase 2: 코드 업데이트 (이 proposal)
1. `database.types.ts` 재생성
2. Constants 업데이트
3. Mapper/Type 업데이트
4. UI 컴포넌트 업데이트

## Impact

- **Affected tables**: `matches`
- **Affected code**:
  - `src/shared/config/constants.ts`
  - `src/shared/types/database.types.ts`
  - `src/features/match/api/match-mapper.ts`
  - `src/features/match/model/types.ts`
  - `src/features/match-create/api/match-create-mapper.ts`
  - `src/features/match-create/ui/match-create-view.tsx`
  - `src/features/match-create/ui/components/match-create-specs.tsx`
  - `src/features/match-create/model/schema.ts`
  - `src/features/match-create/mappers/match-to-prefill-mapper.ts`
  - `src/features/match/ui/match-list-item.tsx`
  - `src/features/match/ui/components/filter/detail-filter-modal.tsx`
  - `src/features/match/ui/components/detail/match-info-section.tsx`

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| 기존 데이터 손실 | match_format 컬럼 추가 후 데이터 복사, match_type은 덮어쓰기 |
| 빌드 오류 | Phase 1(DB) 완료 후 Phase 2(코드) 순차 진행 |
| 하위 호환성 | 신규 컬럼에 DEFAULT 값 설정 |
