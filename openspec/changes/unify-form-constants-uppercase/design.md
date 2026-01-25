# Design: Form 상수값 대문자 통일

## Context

이전 작업 (`refactor-match-mapping-constants`)에서 Gender, CostType을 대문자로 통일했으나,
PlayStyle, RefereeType, CourtSize, Position은 범위가 넓어 별도 작업으로 분리됨.

현재 문제:
```
Form 초기값: "internal_2" (소문자)
Constants OPTIONS: "INTERNAL_2WAY" (대문자)
→ isActive 비교 실패 → 아무것도 선택되지 않음
```

## Goals

- 모든 Form 값을 DB/Constants와 동일한 대문자로 통일
- Constants에서 DEFAULT 값을 제공하여 하드코딩 제거
- Mapper의 불필요한 변환 로직 제거

## Non-Goals

- UI 라벨 변경 (한글 라벨은 유지)
- DB 스키마 변경

## Decisions

### Decision 1: DEFAULT 상수 패턴

**선택**: 각 도메인 값에 대해 `_DEFAULT` 상수 추가

```typescript
// match-constants.ts
export const PLAY_STYLE_VALUES = ['INTERNAL_2WAY', 'INTERNAL_3WAY', 'EXCHANGE'] as const;
export type PlayStyleValue = typeof PLAY_STYLE_VALUES[number];
export const PLAY_STYLE_DEFAULT: PlayStyleValue = 'INTERNAL_2WAY';  // 추가
```

**이유**:
- 하드코딩 제거
- 타입 안전성 보장 (`PlayStyleValue` 타입)
- 기본값 변경 시 단일 수정점

### Decision 2: Schema 값 직접 대문자 사용

**선택**: Zod schema에서 DB 값을 직접 사용

```typescript
// Before
gameFormat: z.enum(['internal_2', 'internal_3', 'exchange'])

// After - Constants 참조
gameFormat: z.enum(PLAY_STYLE_VALUES)
```

**이유**:
- 단일 진실 공급원 유지
- 값 변경 시 Constants만 수정

### Decision 3: Position UI 변경 방식

**선택**: 한글 버튼 유지, 내부 값만 대문자 코드 사용

```tsx
// apply-modal.tsx
{POSITION_OPTIONS.map((pos) => (
  <button onClick={() => setPosition(pos.value)}>  {/* 'G' */}
    {pos.label}  {/* '가드' */}
  </button>
))}
```

**이유**:
- UX 변경 없음 (사용자는 여전히 한글 버튼 클릭)
- 내부적으로 대문자 코드 사용

### Decision 4: "최근 경기 불러오기" 처리

**선택**: 역방향 매핑 제거, DB 값 그대로 사용

```typescript
// Before (match-create-view.tsx)
const formatMap = { INTERNAL_2WAY: 'internal_2', ... };
setGameFormatType(formatMap[options.play_style]);

// After
setGameFormatType(options.play_style);  // 이미 대문자
```

## Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    match-constants.ts                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  VALUES: ['INTERNAL_2WAY', 'INTERNAL_3WAY', ...]    │   │
│  │  LABELS: { INTERNAL_2WAY: '자체전 (2파전)', ... }    │   │
│  │  OPTIONS: [{ value, label }, ...]                   │   │
│  │  DEFAULT: 'INTERNAL_2WAY'                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐          ┌──────────┐          ┌─────────┐
   │ Schema  │          │   Form   │          │ Mapper  │
   │ (Zod)   │          │   UI     │          │         │
   ├─────────┤          ├──────────┤          ├─────────┤
   │ enum:   │          │ useState │          │ 변환    │
   │ VALUES  │          │ (DEFAULT)│          │ 없음    │
   └─────────┘          └──────────┘          └─────────┘
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 기존 저장된 폼 데이터 호환성 | 없음 - 폼 상태는 영속화되지 않음 |
| 타입 에러 발생 가능 | 단계적 마이그레이션, 빌드 검증 |
| "최근 경기 불러오기" 버그 | 역방향 매핑 제거 후 테스트 |

## Open Questions

없음 - 이전 작업에서 패턴이 확립됨.
