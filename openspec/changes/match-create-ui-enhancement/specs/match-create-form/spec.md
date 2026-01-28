# Spec: Match Create Form

매치 생성 폼의 UI 컴포넌트 및 입력 필드 요구사항을 정의합니다.

## ADDED Requirements

### Requirement: Navy Chip Variant
Chip 컴포넌트는 `navy` variant를 제공해야 합니다. 이 variant는 날짜 선택 UI와 동일한 스타일(`bg-slate-900 text-white`)을 사용합니다.

#### Scenario: Navy chip inactive state
- **WHEN** navy variant Chip이 비활성 상태일 때
- **THEN** `bg-white text-slate-600 border-slate-200` 스타일이 적용되어야 함

#### Scenario: Navy chip active state
- **WHEN** navy variant Chip이 활성 상태일 때
- **THEN** `bg-slate-900 text-white border-slate-900` 스타일이 적용되어야 함

### Requirement: Contact Toggle Style Unification
문의하기(연락처) 섹션의 Switch 토글은 포지션 무관/포지션별 토글과 동일한 스타일을 사용해야 합니다.

#### Scenario: Contact toggle checked state
- **WHEN** 문의하기 토글이 오픈채팅으로 체크되었을 때
- **THEN** Switch에 `data-[state=checked]:bg-[#FF6600]` 스타일이 적용되어야 함

#### Scenario: Contact toggle unchecked state
- **WHEN** 문의하기 토글이 전화번호로 체크 해제되었을 때
- **THEN** Switch에 `data-[state=unchecked]:bg-slate-200` 스타일이 적용되어야 함

### Requirement: Age Range Limitation
권장 나이 선택은 20대부터 60대까지만 제공해야 합니다.

#### Scenario: Age options display
- **WHEN** 권장 나이 선택 UI가 렌더링될 때
- **THEN** "무관", "20대", "30대", "40대", "50대", "60대" 옵션만 표시되어야 함
- **AND** "70대" 옵션은 표시되지 않아야 함

### Requirement: Guaranteed Quarters Removal
경기 진행 방식 섹션에서 보장 쿼터 항목을 제거해야 합니다.

#### Scenario: Game format section without guaranteed quarters
- **WHEN** 경기 진행 방식 섹션이 렌더링될 때
- **THEN** "보장 쿼터" 입력 필드가 표시되지 않아야 함

#### Scenario: Form submission without guaranteed quarters
- **WHEN** 매치 생성 폼이 제출될 때
- **THEN** `guaranteed_quarters` 필드가 DB에 저장되지 않아야 함 (null)

### Requirement: Individual Host Team Name
개인("내 프로필") 주최 선택 시 팀/모임 이름 입력 필드가 표시되어야 합니다.

#### Scenario: Team name field display on individual host
- **WHEN** 주최 정보에서 "내 프로필 (개인)"을 선택했을 때
- **THEN** "팀/모임 이름" Input 필드가 주최 정보 Select 아래에 표시되어야 함
- **AND** 필드는 필수 입력(*)으로 표시되어야 함

#### Scenario: Team name field hidden on team host
- **WHEN** 주최 정보에서 팀을 선택했을 때
- **THEN** "팀/모임 이름" Input 필드가 표시되지 않아야 함

#### Scenario: Team name validation
- **WHEN** 개인 주최 상태에서 팀 이름 없이 폼을 제출하려 할 때
- **THEN** 유효성 검사 에러가 표시되어야 함
- **AND** 폼 제출이 차단되어야 함

#### Scenario: Team name saved to database
- **WHEN** 개인 주최로 폼이 제출될 때
- **THEN** 입력된 팀 이름이 `manual_team_name` 컬럼에 저장되어야 함

### Requirement: Team Creation Benefit Message
개인 주최 시 팀 생성의 이점을 안내하는 문구를 표시해야 합니다.

#### Scenario: Benefit message display
- **WHEN** "내 프로필 (개인)"이 선택된 상태일 때
- **THEN** "팀을 생성하면 팀을 관리하고 게스트를 편하게 모집할 수 있어요" 문구가 표시되어야 함

### Requirement: Contact Label Naming
문의하기 레이블의 네이밍을 변경해야 합니다.

#### Scenario: Contact label text
- **WHEN** 운영 정보 섹션이 렌더링될 때
- **THEN** 연락처 필드의 레이블이 "문의연락처"로 표시되어야 함
- **AND** 기존 "문의하기 (연락처)" 텍스트는 사용되지 않아야 함
