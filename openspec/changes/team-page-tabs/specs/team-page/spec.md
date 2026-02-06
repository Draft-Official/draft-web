## ADDED Requirements

### Requirement: Team page tab structure
`/team` 페이지는 2개의 탭(나의 팀 / 팀 생성하기+)으로 구성된다. 기본 탭은 "나의 팀"이다.

#### Scenario: User views team page
- **WHEN** 사용자가 `/team` 페이지에 접근한다
- **THEN** "나의 팀"과 "팀 생성하기+" 2개의 탭이 표시된다
- **THEN** "나의 팀" 탭이 기본 선택 상태이다

#### Scenario: User switches tabs
- **WHEN** 사용자가 "팀 생성하기+" 탭을 클릭한다
- **THEN** 팀 생성 기능 소개 화면이 표시된다

---

### Requirement: My teams display with horizontal scroll
사용자의 소속 팀이 1개 이상일 때, 팀 카드를 가로 스크롤로 표시한다.

#### Scenario: User has multiple teams
- **WHEN** 사용자가 2개 이상의 팀에 소속되어 있다
- **THEN** 팀 카드들이 가로 스크롤 영역에 표시된다
- **THEN** 각 카드는 1:1 비율로 팀 로고, 팀 이름, 역할(Leader/Manager/Member), 정기운동 정보(요일, 시간)를 포함한다

#### Scenario: User has one team
- **WHEN** 사용자가 1개의 팀에만 소속되어 있다
- **THEN** 단일 팀 카드가 표시된다

---

### Requirement: Empty state when no teams
사용자가 소속된 팀이 없을 때 Empty State를 표시하고 팀 생성을 유도한다.

#### Scenario: User has no teams
- **WHEN** 사용자가 어떤 팀에도 소속되어 있지 않다
- **THEN** "소속 팀이 없습니다" 메시지가 표시된다
- **THEN** "팀 생성하기+" 탭으로 이동하는 안내가 표시된다

---

### Requirement: Pending vote matches display
나의 팀 탭에서 투표 중인 경기 목록을 "미투표 경기" 섹션에 표시한다.

#### Scenario: User has pending vote matches
- **WHEN** 사용자의 소속 팀에 투표 중인(VOTING 상태) 경기가 있다
- **THEN** "미투표 경기" 섹션이 표시된다
- **THEN** 각 경기 카드에 "투표중" 뱃지, 날짜, 시간, 장소, 팀 이름, 투표 현황(참석/불참/미투표 인원)이 표시된다

#### Scenario: No pending vote matches
- **WHEN** 투표 중인 경기가 없다
- **THEN** "미투표 경기" 섹션이 표시되지 않거나 "투표할 경기가 없습니다" 메시지가 표시된다

---

### Requirement: Team create benefits display
"팀 생성하기+" 탭에서 팀 생성 시 이점을 소개한다.

#### Scenario: User views team create tab
- **WHEN** 사용자가 "팀 생성하기+" 탭을 선택한다
- **THEN** 다음 3가지 기능 소개가 표시된다:
  - 팀원 관리: "팀원들의 정기운동 참석과 회비를 관리하세요"
  - 정기운동 생성: "주간 운동을 자동으로 생성하고 팀원들의 참석/불참 투표를 진행해요. 인원이 부족하면 게스트 모집으로 전환할 수 있습니다."
  - 초대 링크 공유: "팀 생성 후 카카오톡으로 초대 링크를 공유하여 팀원을 쉽게 모집할 수 있습니다."

---

### Requirement: Navigate to team create page
"팀 생성하기+" 탭 하단의 버튼을 통해 `/team/create` 페이지로 이동한다.

#### Scenario: User clicks create team button
- **WHEN** 사용자가 "팀 만들기" 버튼을 클릭한다
- **THEN** `/team/create` 페이지로 이동한다

---

### Requirement: Team card navigation
팀 카드를 클릭하면 해당 팀 상세 페이지로 이동한다.

#### Scenario: User clicks team card
- **WHEN** 사용자가 팀 카드를 클릭한다
- **THEN** `/team/[code]` 페이지로 이동한다 (팀 코드 기반 라우팅)
