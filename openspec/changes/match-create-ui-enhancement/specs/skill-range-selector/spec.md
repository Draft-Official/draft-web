# Spec: Skill Range Selector

실력 범위(min-max) 선택 컴포넌트의 요구사항을 정의합니다.

## ADDED Requirements

### Requirement: Skill Range Selection
실력 선택은 단일 값이 아닌 최소~최대 범위를 선택할 수 있어야 합니다.

#### Scenario: Range slider display
- **WHEN** 실력 선택 UI가 렌더링될 때
- **THEN** 최소 실력과 최대 실력을 동시에 선택할 수 있는 범위 슬라이더가 표시되어야 함
- **AND** 실력 레벨 1(초보1)부터 7(선출)까지 선택 가능해야 함

#### Scenario: Range selection interaction
- **WHEN** 사용자가 범위 슬라이더를 조작할 때
- **THEN** 최소값과 최대값이 각각 독립적으로 조절 가능해야 함
- **AND** 최소값은 최대값을 초과할 수 없어야 함

#### Scenario: Range display format
- **WHEN** 실력 범위가 선택되었을 때
- **THEN** "중급1 ~ 상급1" 형식으로 선택된 범위가 표시되어야 함

#### Scenario: Single level selection
- **WHEN** 최소값과 최대값이 동일할 때
- **THEN** "중급2" 형식으로 단일 레벨만 표시되어야 함

### Requirement: Skill Range Visual Feedback
범위 슬라이더는 선택된 범위를 시각적으로 명확하게 표시해야 합니다.

#### Scenario: Selected range highlight
- **WHEN** 실력 범위가 선택되었을 때
- **THEN** 선택된 범위 구간이 색상으로 강조 표시되어야 함
- **AND** 선택되지 않은 구간은 회색으로 표시되어야 함

#### Scenario: Level color coding
- **WHEN** 범위 슬라이더가 표시될 때
- **THEN** 초보(1-2)는 녹색, 중급(3-4)은 노랑, 상급(5-6)은 주황, 선출(7)은 빨강으로 표시되어야 함

### Requirement: Skill Range Description
선택된 실력 범위에 대한 설명을 제공해야 합니다.

#### Scenario: Range description display
- **WHEN** 실력 범위가 선택되었을 때
- **THEN** 선택된 범위의 최소/최대 레벨에 대한 설명이 표시되어야 함

#### Scenario: Description card content
- **WHEN** "중급1 ~ 상급1" 범위가 선택되었을 때
- **THEN** 최소 레벨(중급1)과 최대 레벨(상급1)의 설명이 모두 표시되어야 함

### Requirement: Skill Range Data Model
실력 범위는 최소값과 최대값 두 개의 필드로 저장되어야 합니다.

#### Scenario: Form state structure
- **WHEN** SkillRangeSlider 컴포넌트가 사용될 때
- **THEN** `minValue: number`와 `maxValue: number` props를 받아야 함
- **AND** `onChange: (min: number, max: number) => void` 콜백을 통해 값을 전달해야 함

#### Scenario: Database storage
- **WHEN** 매치가 생성될 때
- **THEN** 실력 범위가 `skill_level_min`과 `skill_level_max` 컬럼에 저장되어야 함

### Requirement: Skill Range Default Value
실력 범위의 기본값을 제공해야 합니다.

#### Scenario: Default range on form load
- **WHEN** 매치 생성 폼이 처음 로드될 때
- **THEN** 실력 범위 기본값은 min=1, max=7 (전체 범위)로 설정되어야 함

#### Scenario: Prefill from recent match
- **WHEN** 최근 매치 데이터로 폼이 프리필될 때
- **THEN** 해당 매치의 실력 범위가 슬라이더에 반영되어야 함
