## Context

현재 match[id] 상세 페이지에서 데이터 흐름:

```
DB (matches) → match-mapper.ts → GuestListMatch → page.tsx (adaptToDetailMatch) → Match → UI Components
```

문제점:
1. `page.tsx`에 70줄 이상의 `adaptToDetailMatch` 함수가 있음 (app/ 디렉토리 규칙 위반)
2. `Match.rule.type`과 `Match.rule.referee`가 소문자 값 사용 (`'2team'`, `'self'`)
3. constants.ts는 대문자 값 사용 (`'INTERNAL_2WAY'`, `'SELF'`)
4. UI 컴포넌트들이 인라인 매핑으로 대문자→소문자 역변환 수행

## Goals / Non-Goals

**Goals:**
- constants.ts를 유일한 enum/label 매핑 소스로 사용
- `adaptToDetailMatch` 함수를 mapper 레이어로 이동
- `Match` 타입이 constants 타입을 직접 참조하도록 변경
- UI 컴포넌트에서 인라인 매핑 제거

**Non-Goals:**
- `Match`와 `GuestListMatch` 타입 통합 (별도 리팩토링 범위)
- DB 스키마 변경
- 다른 페이지의 SSOT 정리 (이 change는 match[id] 상세 페이지만)

## Decisions

### 1. Match.rule 타입을 constants 타입으로 변경

**결정**: `Match.rule.type`과 `Match.rule.referee`를 constants 타입으로 변경

```typescript
// Before
rule?: {
  type: '2team' | '3team' | 'lesson' | 'exchange';
  referee: 'self' | 'guest' | 'pro';
};

// After
import { PlayStyleValue, RefereeTypeValue } from '@/shared/config/constants';
rule?: {
  type: PlayStyleValue;  // 'INTERNAL_2WAY' | 'INTERNAL_3WAY' | 'EXCHANGE'
  referee: RefereeTypeValue;  // 'SELF' | 'STAFF' | 'PRO'
};
```

**대안 고려**:
- ~~소문자 값 유지 + 별도 매핑 함수~~ → 이중 매핑으로 복잡도 증가
- ~~새로운 타입 정의~~ → SSOT 원칙 위반

**Rationale**: constants.ts가 이미 대문자 값과 라벨을 정의하고 있으므로, 이를 그대로 사용하는 것이 SSOT에 부합

### 2. guestListMatchToMatch 함수를 mapper에 추가

**결정**: `match-mapper.ts`에 `guestListMatchToMatch()` 함수 추가

```typescript
// features/match/api/match-mapper.ts
export function guestListMatchToMatch(data: GuestListMatch): Match {
  // 변환 로직
}
```

**대안 고려**:
- ~~page.tsx에 유지~~ → app/ 디렉토리에 비즈니스 로직 금지
- ~~별도 유틸 파일~~ → mapper가 적합한 위치

**Rationale**: 타입 변환은 mapper의 책임이며, feature API 레이어에 속함

### 3. UI 컴포넌트에서 constants getter 함수 사용

**결정**: 인라인 매핑 대신 constants.ts의 `LABELS` 객체 또는 getter 함수 사용

```typescript
// Before (match-rule-section.tsx)
const typeLabel = {
  '2team': '자체전 (2파전)',
  ...
}[rule.type];

// After
import { PLAY_STYLE_LABELS } from '@/shared/config/constants';
const typeLabel = PLAY_STYLE_LABELS[rule.type];
```

**Rationale**: constants.ts에 이미 `PLAY_STYLE_LABELS`, `REFEREE_TYPE_LABELS` 정의되어 있음

### 4. Position 매핑도 constants 사용

**결정**: `recruitment-status.tsx`의 config 객체를 `POSITION_LABELS` 사용으로 변경

```typescript
// After
import { POSITION_LABELS } from '@/shared/config/constants';
const positionConfig = {
  g: { label: POSITION_LABELS.G.short, title: POSITION_LABELS.G.full },
  ...
};
```

## Risks / Trade-offs

### Breaking Change 위험
**Risk**: `Match.rule.type` 값이 `'2team'` → `'INTERNAL_2WAY'`로 변경되어 기존 사용처에서 오류 발생 가능

**Mitigation**:
- TypeScript 컴파일러가 타입 불일치 검출
- 영향받는 파일이 제한적 (match-detail-view.tsx 하위 컴포넌트들)
- 모든 변경을 단일 커밋으로 처리하여 일관성 유지

### 타입 복잡도 증가
**Risk**: `Match`와 `GuestListMatch`가 여전히 별도로 존재하여 혼란 가능

**Trade-off**: 이 change에서는 SSOT 정리에 집중하고, 타입 통합은 별도 리팩토링으로 분리
