# Change: Match 매핑 상수 통합 및 역할 분리

## Why

현재 match 관련 매핑 로직이 여러 파일에 분산되어 있어 일관성이 없고 유지보수가 어렵습니다:
- `match-mapper.ts`에 inline 매핑 객체 (costTypeMap, genderMap)
- `match-constants.ts`에 일부 매핑 (REQUIREMENTS_MAP, PLAY_STYLE_MAP 등)
- UI 컴포넌트들에 중복된 매핑 로직 (GENDER_CONFIG, typeLabel, refereeLabel, position config 등)

또한 서버 값과 클라이언트 값의 케이스 컨벤션이 통일되지 않아 혼란이 발생합니다.

## What Changes

### 1. 매핑 규칙 통일
- **서버(DB) 값과 클라이언트 값을 동일하게 사용**
- Gender: `MALE` / `FEMALE` / `MIXED` (서버 값 그대로)
- Position: `G` / `F` / `C` / `B` (대문자)
- 기타 enum: 서버 UPPER_SNAKE_CASE 값 그대로 사용

### 2. Constants 파일 구조 개편

`shared/config/match-constants.ts`를 확장하여 단일 진실 공급원(Single Source of Truth)으로 만듦:

```
match-constants.ts
├── DB 값 정의 (as const)
│   ├── GENDER_VALUES
│   ├── POSITION_VALUES
│   ├── COST_TYPE_VALUES
│   ├── PLAY_STYLE_VALUES
│   └── REFEREE_TYPE_VALUES
│
├── DB값 → UI 라벨 매핑
│   ├── GENDER_LABELS: Record<GenderValue, string>
│   ├── POSITION_LABELS: Record<PositionValue, { short: string, full: string }>
│   ├── COST_TYPE_LABELS
│   ├── PLAY_STYLE_LABELS
│   └── REFEREE_TYPE_LABELS
│
├── UI 스타일 매핑 (색상 등)
│   ├── GENDER_STYLES: Record<GenderValue, { color: string, bgColor: string }>
│   └── LEVEL_STYLES
│
└── Form/Filter Options
    ├── GENDER_OPTIONS
    ├── POSITION_OPTIONS
    └── ...
```

### 3. 역할 분리 명확화

| Layer | 역할 | 매핑 수행 |
|-------|-----|----------|
| **Mapper** (`match-mapper.ts`) | DB row → Client 타입 변환 | 타입 변환만 (값 변경 X) |
| **Constants** (`match-constants.ts`) | 매핑 정의 및 라벨 변환 | 모든 매핑 집중 |
| **UI Component** | 렌더링 | 매핑 없이 표시만 |

### 4. 변경 대상 파일

**수정:**
- `shared/config/match-constants.ts` - 모든 매핑 통합
- `shared/types/match.ts` - 타입 정의 업데이트
- `features/match/api/match-mapper.ts` - inline 매핑 제거
- `features/match/ui/match-list-item.tsx` - GENDER_CONFIG 제거
- `features/match/ui/components/detail/match-rule-section.tsx` - inline 매핑 제거
- `features/match/ui/components/detail/recruitment-status.tsx` - position config 제거
- `features/match/ui/components/filter/detail-filter-modal.tsx` - 중복 옵션 제거

## Impact

- **Affected specs**: match
- **Affected code**:
  - `shared/config/match-constants.ts`
  - `shared/types/match.ts`
  - `features/match/api/match-mapper.ts`
  - `features/match/ui/*.tsx` (여러 컴포넌트)

## Migration Strategy

1. 먼저 `match-constants.ts`에 새로운 구조로 모든 매핑 정의
2. 타입 정의 업데이트 (`Gender` enum 등)
3. `match-mapper.ts`에서 inline 매핑 제거, constants 참조
4. 각 UI 컴포넌트에서 inline 매핑 제거, constants import
5. 기존 `men/women/mixed` 등 사용 코드를 `MALE/FEMALE/MIXED`로 변경

## Non-Goals

- DB 스키마 변경 (서버 측 변경 없음)
- 새로운 기능 추가
- 다른 feature (schedule, application 등) 변경
