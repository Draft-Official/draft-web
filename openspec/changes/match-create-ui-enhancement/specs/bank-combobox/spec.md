# Spec: Bank Combobox

검색 가능한 은행 선택 Combobox 컴포넌트의 요구사항을 정의합니다.

## ADDED Requirements

### Requirement: Bank Selection Combobox
은행 선택은 검색 가능한 Combobox 형태로 제공되어야 합니다.

#### Scenario: Combobox display
- **WHEN** 계좌 정보 입력 UI가 렌더링될 때
- **THEN** 은행명 필드가 검색 가능한 Combobox로 표시되어야 함
- **AND** 기존 자유 텍스트 Input은 사용되지 않아야 함

#### Scenario: Bank search functionality
- **WHEN** 사용자가 은행명을 입력할 때
- **THEN** 입력된 텍스트로 은행 목록이 필터링되어야 함
- **AND** "국민" 입력 시 "KB국민은행"이 결과에 표시되어야 함

#### Scenario: Bank selection
- **WHEN** 사용자가 은행 목록에서 항목을 선택할 때
- **THEN** 선택된 은행명이 Combobox에 표시되어야 함
- **AND** Combobox가 닫혀야 함

### Requirement: Bank List Content
은행 목록은 한국의 주요 은행을 포함해야 합니다.

#### Scenario: Major banks included
- **WHEN** 은행 Combobox가 열릴 때
- **THEN** 다음 은행들이 목록에 포함되어야 함:
  - KB국민은행
  - 신한은행
  - 우리은행
  - 하나은행
  - NH농협은행
  - 카카오뱅크
  - 토스뱅크
  - IBK기업은행
  - SC제일은행
  - 씨티은행
  - 새마을금고
  - 신협
  - 우체국
  - 수협
  - 부산은행
  - 경남은행
  - 대구은행
  - 광주은행
  - 전북은행
  - 제주은행
  - 케이뱅크

#### Scenario: Bank list ordering
- **WHEN** 은행 목록이 표시될 때
- **THEN** 자주 사용되는 은행(KB국민, 신한, 우리, 하나, NH농협, 카카오, 토스)이 상단에 표시되어야 함

### Requirement: Bank Combobox Accessibility
은행 Combobox는 접근성을 준수해야 합니다.

#### Scenario: Keyboard navigation
- **WHEN** 사용자가 키보드로 Combobox를 탐색할 때
- **THEN** 화살표 키로 목록 항목 간 이동이 가능해야 함
- **AND** Enter 키로 선택이 가능해야 함
- **AND** Escape 키로 닫기가 가능해야 함

#### Scenario: Screen reader support
- **WHEN** 스크린리더가 Combobox를 읽을 때
- **THEN** 적절한 ARIA 레이블이 제공되어야 함
- **AND** 선택된 항목이 올바르게 안내되어야 함

### Requirement: Bank Combobox Mobile UX
모바일 환경에서 최적화된 UX를 제공해야 합니다.

#### Scenario: Mobile touch interaction
- **WHEN** 모바일에서 Combobox를 터치할 때
- **THEN** 드롭다운이 화면 내에서 적절히 표시되어야 함
- **AND** 터치 영역이 충분히 커야 함 (최소 44px)

#### Scenario: Mobile keyboard handling
- **WHEN** 모바일에서 검색을 위해 입력할 때
- **THEN** 가상 키보드가 적절히 표시되어야 함
- **AND** 입력 중에도 드롭다운 목록이 보여야 함

### Requirement: Bank Value Persistence
선택된 은행 값은 폼 상태에 올바르게 저장되어야 합니다.

#### Scenario: Form state update
- **WHEN** 은행이 선택될 때
- **THEN** React Hook Form의 bankName 필드가 업데이트되어야 함

#### Scenario: Prefill support
- **WHEN** 기존 데이터로 폼이 프리필될 때
- **THEN** 저장된 은행명이 Combobox에 표시되어야 함
- **AND** 목록에 없는 레거시 값도 표시되어야 함

#### Scenario: Database storage
- **WHEN** 폼이 제출될 때
- **THEN** 선택된 은행의 표시명(예: "KB국민은행")이 DB에 저장되어야 함
