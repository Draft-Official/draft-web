# Change: Form 상수값 대문자 통일 및 DEFAULT 패턴 도입

## Why

현재 Form 컴포넌트에서 사용하는 값과 DB/constants의 값이 불일치합니다:

| 항목 | Form 초기값 | Constants | DB |
|------|------------|-----------|-----|
| Gender | `"men"` | `'MALE'` | `'MALE'` |
| PlayStyle | `"internal_2"` | `'INTERNAL_2WAY'` | `'INTERNAL_2WAY'` |
| RefereeType | `"self"` | `'SELF'` | `'SELF'` |
| CourtSize | `"regular"` | `'REGULAR'` | `'REGULAR'` |
| Position | `"가드"` (한글) | `'G'` | `'G'` |

이로 인해:
1. Mapper에서 불필요한 변환 로직 필요 (`gameFormatMap`, `refereeMap`, `sizeMap`)
2. UI와 DB 값 불일치로 디버깅 어려움
3. 초기 선택값이 Options와 매칭되지 않는 버그

## What Changes

### 1. Constants에 DEFAULT 값 추가

```typescript
// match-constants.ts
export const GENDER_DEFAULT: GenderValue = 'MALE';
export const PLAY_STYLE_DEFAULT: PlayStyleValue = 'INTERNAL_2WAY';
export const REFEREE_TYPE_DEFAULT: RefereeTypeValue = 'SELF';
export const COURT_SIZE_DEFAULT: CourtSizeValue = 'REGULAR';
export const POSITION_DEFAULT: PositionValue = 'G';
```

### 2. Schema 값 대문자로 변경

```typescript
// schema.ts - Before
gameFormat: z.enum(['internal_2', 'internal_3', 'exchange'])
rules.referee: z.enum(['self', 'member', 'pro'])
courtSize: z.enum(['regular', 'short', 'narrow'])

// schema.ts - After
gameFormat: z.enum(['INTERNAL_2WAY', 'INTERNAL_3WAY', 'EXCHANGE'])
rules.referee: z.enum(['SELF', 'STAFF', 'PRO'])
courtSize: z.enum(['REGULAR', 'SHORT', 'NARROW'])
```

### 3. Form 초기값 Constants 참조

```typescript
// match-create-view.tsx - Before
const [gender, setGender] = useState("men");
const [gameFormatType, setGameFormatType] = useState("internal_2");

// match-create-view.tsx - After
import { GENDER_DEFAULT, PLAY_STYLE_DEFAULT } from '@/shared/config/match-constants';
const [gender, setGender] = useState(GENDER_DEFAULT);
const [gameFormatType, setGameFormatType] = useState(PLAY_STYLE_DEFAULT);
```

### 4. Mapper 변환 로직 제거

```typescript
// match-create-mapper.ts - Before
const gameFormatMap = { internal_2: 'INTERNAL_2WAY', ... };
play_style: gameFormatMap[form.gameFormat]

// match-create-mapper.ts - After
play_style: form.gameFormat  // 이미 대문자
```

### 5. Position UI 한글 → 대문자 코드

```typescript
// apply-modal.tsx - Before
const POSITIONS = ['가드', '포워드', '센터'] as const;
const POSITION_MAP = { '가드': 'G', ... };

// apply-modal.tsx - After
import { POSITION_OPTIONS } from '@/shared/config/match-constants';
// POSITION_OPTIONS = [{value: 'G', label: '가드'}, ...]
```

## Impact

- **Affected features**: match-create, match, application, my
- **Affected files**:
  - `shared/config/match-constants.ts` - DEFAULT 상수 추가
  - `features/match-create/model/schema.ts` - enum 값 대문자화
  - `features/match-create/ui/match-create-view.tsx` - 초기값 변경
  - `features/match-create/ui/components/match-create-game-format.tsx` - 기본값 변경
  - `features/match-create/api/match-create-mapper.ts` - 변환 맵 제거
  - `features/application/ui/apply-modal.tsx` - POSITION_MAP 제거
  - `app/my/page.tsx` - POSITION_MAP 제거

## Migration Strategy

1. `match-constants.ts`에 DEFAULT 상수 추가
2. `schema.ts` enum 값 대문자로 변경
3. Form 컴포넌트 초기값을 Constants 참조로 변경
4. Mapper의 inline 변환 맵 제거
5. "최근 경기 불러오기" 로직의 역방향 매핑 제거
6. Position UI를 코드 기반으로 변경

## Non-Goals

- DB 스키마 변경 없음 (이미 대문자 저장 중)
- UI 라벨 변경 없음 (한글 라벨은 LABELS에서 관리)
