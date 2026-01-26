## ADDED Requirements

### Requirement: Match Constants Single Source of Truth

모든 match 관련 enum 값과 라벨 매핑은 `shared/config/match-constants.ts`에서 단일 관리되어야 한다(SHALL).

#### Scenario: Gender 값 매핑

- **WHEN** 서버에서 gender_rule 값 'MALE'이 전달되면
- **THEN** 클라이언트에서도 'MALE' 값을 그대로 사용하고
- **AND** UI 라벨은 GENDER_LABELS['MALE']로 '남성'을 표시한다

#### Scenario: Position 값 매핑

- **WHEN** 서버에서 position 값 'G', 'F', 'C', 'B'가 전달되면
- **THEN** 클라이언트에서도 대문자 값을 그대로 사용하고
- **AND** UI 라벨은 POSITION_LABELS를 통해 '가드', '포워드', '센터', '포워드/센터'를 표시한다

#### Scenario: 새로운 enum 값 추가 시

- **WHEN** 새로운 enum 값(예: 새로운 포지션)을 추가해야 할 때
- **THEN** `match-constants.ts` 파일만 수정하면 된다
- **AND** 타입 정의가 자동으로 업데이트된다

---

### Requirement: Component Display-Only Pattern

UI 컴포넌트는 매핑 로직을 포함하지 않고 표시(display) 역할만 수행해야 한다(SHALL).

#### Scenario: 컴포넌트에서 라벨 표시

- **WHEN** 컴포넌트가 gender 값을 표시해야 할 때
- **THEN** `GENDER_LABELS[value]`를 import하여 사용한다
- **AND** 컴포넌트 내부에 매핑 객체를 정의하지 않는다

#### Scenario: 컴포넌트에서 스타일 적용

- **WHEN** 컴포넌트가 값에 따른 스타일을 적용해야 할 때
- **THEN** `GENDER_STYLES[value]`를 import하여 사용한다
- **AND** 컴포넌트 내부에 스타일 매핑을 정의하지 않는다

---

### Requirement: Mapper Type Conversion Only

`match-mapper.ts`는 DB row를 클라이언트 타입으로 변환하되, 값 자체의 변환은 수행하지 않아야 한다(SHALL).

#### Scenario: Gender 값 전달

- **WHEN** mapper가 DB의 gender_rule 'MALE'을 처리할 때
- **THEN** 클라이언트 타입의 gender 필드에 'MALE'을 그대로 할당한다
- **AND** 'men'과 같은 다른 값으로 변환하지 않는다

#### Scenario: 타입 안전성 보장

- **WHEN** mapper가 값을 할당할 때
- **THEN** TypeScript 타입으로 올바른 값만 허용되도록 한다
- **AND** 잘못된 값이 들어오면 컴파일 타임에 에러가 발생한다
