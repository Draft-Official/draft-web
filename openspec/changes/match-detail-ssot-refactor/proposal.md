## Why

match[id] 상세 페이지에서 constants와 model types를 사용하지 않고 컴포넌트 내부에서 인라인 매핑을 정의하고 있어 **SSOT(Single Source of Truth) 원칙**을 위반하고 있다. 이로 인해 동일한 라벨/값 매핑이 여러 곳에 중복 정의되어 있고, 값 변경 시 모든 위치를 찾아 수정해야 하는 유지보수 부담이 발생한다.

## What Changes

- **`adaptToDetailMatch` 함수 제거**: `page.tsx`의 adapter 함수를 제거하고, `GuestListMatch` → `Match` 변환 로직을 mapper로 이동
- **Match 타입 통합**: `Match` 인터페이스의 `rule.type`과 `rule.referee` 값을 소문자에서 대문자 constants 값으로 변경 **BREAKING**
- **컴포넌트 인라인 매핑 제거**: `match-rule-section.tsx`, `recruitment-status.tsx`에서 인라인 매핑을 constants import로 교체
- **constants getter 함수 추가**: `PLAY_STYLE_LABELS`, `REFEREE_TYPE_LABELS`, `POSITION_LABELS`를 활용한 getter 함수 추가

## Capabilities

### New Capabilities

- `match-detail-types`: Match 상세 페이지에서 사용하는 타입들의 SSOT 정의 및 constants 연동 규칙

### Modified Capabilities

<!-- 기존 specs/ 폴더가 비어있어 수정 대상 없음 -->

## Impact

### 영향받는 코드

| 파일 | 변경 내용 |
|------|----------|
| `src/app/matches/[id]/page.tsx` | `adaptToDetailMatch` 함수 제거, mapper 사용으로 변경 |
| `src/features/match/model/types.ts` | `Match.rule.type`, `Match.rule.referee` 타입을 constants 타입으로 변경 |
| `src/features/match/api/match-mapper.ts` | `GuestListMatch` → `Match` 변환 함수 추가 |
| `src/features/match/ui/components/detail/match-rule-section.tsx` | 인라인 매핑 제거, constants import |
| `src/features/match/ui/components/detail/recruitment-status.tsx` | 인라인 매핑 제거, POSITION_LABELS import |
| `src/shared/config/constants.ts` | 필요 시 getter 함수 추가 |

### Breaking Changes

- `Match.rule.type`: `'2team' | '3team' | 'lesson' | 'exchange'` → `PlayStyleValue` (`'INTERNAL_2WAY' | 'INTERNAL_3WAY' | 'EXCHANGE'`)
- `Match.rule.referee`: `'self' | 'guest' | 'pro'` → `RefereeTypeValue` (`'SELF' | 'STAFF' | 'PRO'`)

### 의존성

- 기존 `Match` 타입을 사용하는 모든 컴포넌트에서 `rule.type`, `rule.referee` 값 확인 필요
