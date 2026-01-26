# Design: Match 매핑 상수 통합

## Context

현재 매핑 로직이 분산되어 있어 다음 문제가 발생:
1. 같은 값에 대해 다른 매핑이 존재 (예: gender가 곳에 따라 'men' 또는 'MALE')
2. UI 컴포넌트에 비즈니스 로직(매핑)이 혼재
3. 새로운 값 추가 시 여러 파일 수정 필요

## Goals

- 모든 매핑을 단일 파일(`match-constants.ts`)에서 관리
- 서버 값과 클라이언트 값을 동일하게 사용하여 혼란 제거
- 컴포넌트는 순수하게 표시 역할만 담당

## Non-Goals

- DB 스키마 변경
- 새로운 도메인 값 추가
- 성능 최적화

## Decisions

### Decision 1: 서버 값을 그대로 사용

**선택**: 서버(DB)의 UPPER_SNAKE_CASE 값을 클라이언트에서도 그대로 사용

**이유**:
- 매핑 레이어 단순화 (변환 없음)
- 디버깅 시 서버/클라이언트 값 일치로 추적 용이
- API 응답과 UI 상태의 일관성

**대안 고려**:
- 클라이언트용 lowercase 값 사용 → 매핑 복잡성 증가로 기각

### Decision 2: Constants 파일 구조

```typescript
// 1. DB 값 정의 (타입 추론용)
export const GENDER_VALUES = ['MALE', 'FEMALE', 'MIXED'] as const;
export type GenderValue = typeof GENDER_VALUES[number];

// 2. DB값 → UI 라벨 매핑
export const GENDER_LABELS: Record<GenderValue, string> = {
  MALE: '남성',
  FEMALE: '여성',
  MIXED: '성별 무관',
};

// 3. UI 스타일 (필요시)
export const GENDER_STYLES: Record<GenderValue, { color: string; bgColor: string }> = {
  MALE: { color: 'text-blue-600', bgColor: 'bg-blue-50' },
  FEMALE: { color: 'text-pink-600', bgColor: 'bg-pink-50' },
  MIXED: { color: 'text-purple-600', bgColor: 'bg-purple-50' },
};

// 4. Form Options (select, filter용)
export const GENDER_OPTIONS = GENDER_VALUES.map(value => ({
  value,
  label: GENDER_LABELS[value],
}));
```

### Decision 3: Mapper의 역할

**Before** (현재):
```typescript
// match-mapper.ts
const genderMap = { MALE: 'men', FEMALE: 'women', MIXED: 'mixed' };
return { gender: genderMap[row.gender_rule] };
```

**After** (변경 후):
```typescript
// match-mapper.ts
// 값 변환 없이 타입만 변환
return { gender: row.gender_rule as GenderValue };
```

Mapper는 DB row의 snake_case 필드를 camelCase로 변환하고 타입을 지정하는 역할만 담당.
라벨 변환은 UI에서 constants를 통해 수행.

### Decision 4: UI 컴포넌트 패턴

```tsx
// Before
const GENDER_CONFIG = {
  men: { label: '남성', className: 'text-blue-600' },
  // ...
};
<span className={GENDER_CONFIG[gender].className}>
  {GENDER_CONFIG[gender].label}
</span>

// After
import { GENDER_LABELS, GENDER_STYLES } from '@/shared/config/match-constants';

<span className={GENDER_STYLES[gender].color}>
  {GENDER_LABELS[gender]}
</span>
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 기존 코드에서 'men', 'women' 등 문자열 직접 비교하는 곳 | grep으로 전체 검색 후 수정 |
| 타입 변경으로 인한 컴파일 에러 | 단계적 마이그레이션, 타입 체크로 누락 방지 |

## Open Questions

없음 - 사용자가 케이스 컨벤션과 값 규칙을 명확히 결정함.
