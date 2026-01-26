## ADDED Requirements

### Requirement: Custom Hooks for Business Logic Separation

복잡한 비즈니스 로직은 재사용 가능한 커스텀 훅으로 분리되어야 한다(SHALL).

#### Scenario: Location Search Hook Usage

- **WHEN** 장소 검색 기능이 필요할 때
- **THEN** `useLocationSearch()` 훅을 사용한다
- **AND** 컴포넌트는 상태 및 핸들러만 소비하고 검색 로직은 포함하지 않는다

#### Scenario: Recent Match Prefill Hook Usage

- **WHEN** 최근 경기 데이터를 현재 폼에 매핑해야 할 때
- **THEN** `useRecentMatchPrefill()` 훅을 사용한다
- **AND** 매핑 로직은 `MatchToPrefillMapper` 클래스로 분리되어 있다

#### Scenario: Form Submit Hook Usage

- **WHEN** 폼 제출 및 기본값 저장 로직이 필요할 때
- **THEN** `useMatchFormSubmit()` 훅을 사용한다
- **AND** API 호출, 기본값 저장, 라우팅이 훅 내부에서 처리된다

---

### Requirement: FormContext Pattern for Child Components

하위 컴포넌트는 Props Drilling 대신 FormContext를 통해 폼 상태에 접근해야 한다(SHALL).

#### Scenario: FormContext Access in Child Component

- **WHEN** 하위 컴포넌트가 폼 필드를 관리해야 할 때
- **THEN** `useFormContext<MatchCreateFormData>()`를 사용한다
- **AND** 부모로부터 상태와 setter 함수를 Props로 전달받지 않는다

#### Scenario: Controller for Field Management

- **WHEN** 복잡한 폼 필드를 관리할 때
- **THEN** `<Controller>` 컴포넌트를 사용한다
- **AND** onChange/value를 수동으로 연결하지 않는다

#### Scenario: Props Minimization

- **WHEN** 새로운 하위 컴포넌트를 생성할 때
- **THEN** 읽기 전용 prop만 전달한다 (예: `isExistingGym`)
- **AND** 폼 관련 상태는 FormContext로 접근한다

---

### Requirement: Zod Schema for Validation

폼 검증 로직은 Zod Schema로 선언적으로 정의되어야 한다(SHALL).

#### Scenario: Required Field Validation

- **WHEN** 필수 필드를 검증할 때
- **THEN** Zod schema에 `.min(1, "에러 메시지")` 조건을 정의한다
- **AND** onSubmit 내부에 수동 if 문을 포함하지 않는다

#### Scenario: Conditional Validation

- **WHEN** 조건부 검증이 필요할 때 (예: 포지션 모집 시 최소 1명)
- **THEN** `.refine()` 또는 `.discriminatedUnion()`을 사용한다
- **AND** 검증 로직이 타입 안전하게 구현된다

#### Scenario: Error Display

- **WHEN** 검증 에러를 표시할 때
- **THEN** react-hook-form의 `formState.errors`를 사용한다
- **AND** toast 메시지 대신 필드별 에러 메시지를 우선한다

---

### Requirement: UI State Localization

UI 가시성 상태(show/hide)는 해당 컴포넌트 내부에서 관리되어야 한다(SHALL).

#### Scenario: Dialog State Management

- **WHEN** 컴포넌트 내부의 dialog를 열고 닫을 때
- **THEN** 해당 컴포넌트 내부에 `useState(false)`를 선언한다
- **AND** 부모 컴포넌트로 상태를 끌어올리지 않는다

#### Scenario: Parent Control Exception

- **WHEN** 부모가 하위 컴포넌트의 UI 상태를 제어해야 할 때만
- **THEN** Props로 `open`과 `onOpenChange`를 전달한다
- **AND** 그 외 경우는 로컬 상태를 사용한다

---

### Requirement: Domain-Grouped State Structure

관련된 상태는 도메인별로 그룹화되어야 한다(SHALL).

#### Scenario: Facilities State Grouping

- **WHEN** 시설 관련 필드를 관리할 때
- **THEN** `facilities: { parking, amenities, equipment, courtSize }` 구조를 사용한다
- **AND** 평평한(flat) 구조로 펼치지 않는다

#### Scenario: Specs State Grouping

- **WHEN** 경기 스펙 필드를 관리할 때
- **THEN** `specs: { matchType, gameFormat, level, gender }` 구조를 사용한다
- **AND** 각 필드를 개별 useState로 관리하지 않는다

#### Scenario: Type Safety with Grouped State

- **WHEN** 그룹화된 상태를 업데이트할 때
- **THEN** TypeScript가 중첩된 경로를 타입 체크한다
- **AND** 잘못된 필드명이나 타입이 컴파일 타임에 감지된다

---

### Requirement: Mapper Class for Complex Transformations

복잡한 데이터 변환 로직은 Mapper 클래스로 분리되어야 한다(SHALL).

#### Scenario: Match to Prefill Transformation

- **WHEN** 최근 경기 데이터를 폼 데이터로 변환할 때
- **THEN** `MatchToPrefillMapper` 클래스를 사용한다
- **AND** 변환 로직이 12개 섹션으로 구조화되어 있다 (mapBasicInfo, mapRecruitment 등)

#### Scenario: Testable Transformation Logic

- **WHEN** 변환 로직을 테스트할 때
- **THEN** Mapper 클래스를 독립적으로 인스턴스화하여 테스트한다
- **AND** 컴포넌트를 마운트하지 않고도 로직을 검증할 수 있다

#### Scenario: Reusable Transformation

- **WHEN** 동일한 변환 로직이 다른 곳에서 필요할 때
- **THEN** Mapper 클래스를 import하여 재사용한다
- **AND** 로직을 복사-붙여넣기하지 않는다
