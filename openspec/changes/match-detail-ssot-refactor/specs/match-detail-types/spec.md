## ADDED Requirements

### Requirement: Match rule 타입은 constants 타입을 사용해야 한다

`Match.rule.type`과 `Match.rule.referee` 필드는 `@/shared/config/constants.ts`에 정의된 `PlayStyleValue`와 `RefereeTypeValue` 타입을 사용해야 한다 (SHALL).

#### Scenario: Match.rule.type이 PlayStyleValue 타입을 사용한다
- **WHEN** `Match` 인터페이스의 `rule.type` 필드를 정의할 때
- **THEN** 타입은 `PlayStyleValue` (`'INTERNAL_2WAY' | 'INTERNAL_3WAY' | 'EXCHANGE'`)이어야 한다

#### Scenario: Match.rule.referee가 RefereeTypeValue 타입을 사용한다
- **WHEN** `Match` 인터페이스의 `rule.referee` 필드를 정의할 때
- **THEN** 타입은 `RefereeTypeValue` (`'SELF' | 'STAFF' | 'PRO'`)이어야 한다

---

### Requirement: GuestListMatch → Match 변환은 mapper에서 수행해야 한다

`GuestListMatch`에서 `Match` 타입으로의 변환 로직은 `features/match/api/match-mapper.ts`의 함수로 정의되어야 한다 (SHALL). `app/` 디렉토리에 변환 로직이 존재해서는 안 된다 (MUST NOT).

#### Scenario: page.tsx에서 mapper 함수를 사용한다
- **WHEN** `matches/[id]/page.tsx`에서 `GuestListMatch` 데이터를 `Match` 타입으로 변환할 때
- **THEN** `match-mapper.ts`의 `guestListMatchToMatch()` 함수를 호출해야 한다

#### Scenario: page.tsx에 adaptToDetailMatch 함수가 없다
- **WHEN** `matches/[id]/page.tsx` 파일을 검사할 때
- **THEN** `adaptToDetailMatch` 또는 유사한 인라인 변환 함수가 존재하지 않아야 한다

---

### Requirement: UI 컴포넌트는 인라인 매핑 대신 constants를 사용해야 한다

UI 컴포넌트에서 enum 값을 라벨로 변환할 때, 컴포넌트 내부에 인라인 매핑 객체를 정의하지 않고 `@/shared/config/constants.ts`의 `*_LABELS` 객체를 import하여 사용해야 한다 (SHALL).

#### Scenario: match-rule-section에서 PLAY_STYLE_LABELS를 사용한다
- **WHEN** `match-rule-section.tsx`에서 경기 형태 라벨을 표시할 때
- **THEN** `PLAY_STYLE_LABELS[rule.type]`을 사용하여 라벨을 조회해야 한다

#### Scenario: match-rule-section에서 REFEREE_TYPE_LABELS를 사용한다
- **WHEN** `match-rule-section.tsx`에서 심판 방식 라벨을 표시할 때
- **THEN** `REFEREE_TYPE_LABELS[rule.referee]`를 사용하여 라벨을 조회해야 한다

#### Scenario: recruitment-status에서 POSITION_LABELS를 사용한다
- **WHEN** `recruitment-status.tsx`에서 포지션 라벨을 표시할 때
- **THEN** `POSITION_LABELS`를 사용하여 short/full 라벨을 조회해야 한다

#### Scenario: 인라인 매핑 객체가 없다
- **WHEN** `match-rule-section.tsx` 또는 `recruitment-status.tsx`를 검사할 때
- **THEN** `const typeLabel = { ... }` 또는 `const config = { ... }` 형태의 인라인 매핑이 존재하지 않아야 한다

---

### Requirement: constants.ts는 모든 enum 값의 SSOT이다

`@/shared/config/constants.ts`는 다음 항목들의 Single Source of Truth로서, 다른 파일에서 동일한 값을 중복 정의해서는 안 된다 (MUST NOT):
- `PLAY_STYLE_VALUES` / `PLAY_STYLE_LABELS`
- `REFEREE_TYPE_VALUES` / `REFEREE_TYPE_LABELS`
- `POSITION_VALUES` / `POSITION_LABELS`
- `GENDER_VALUES` / `GENDER_LABELS`

#### Scenario: 경기 형태 라벨이 constants에만 정의된다
- **WHEN** 코드베이스에서 "자체전 (2파전)" 문자열을 검색할 때
- **THEN** `constants.ts`의 `PLAY_STYLE_LABELS`에만 존재해야 한다

#### Scenario: 심판 방식 라벨이 constants에만 정의된다
- **WHEN** 코드베이스에서 "자체콜", "게스트/팀원", "전문 심판" 문자열을 검색할 때
- **THEN** `constants.ts`의 `REFEREE_TYPE_LABELS`에만 존재해야 한다
