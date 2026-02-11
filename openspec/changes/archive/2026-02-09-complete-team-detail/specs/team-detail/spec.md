## MODIFIED Requirements

### Requirement: Team detail header displays settings and share buttons
팀 상세 페이지 헤더에서 기존 단일 설정 아이콘 버튼 대신 "팀 설정"과 "..." (공유) 버튼이 분리되어 표시되어야 한다.

#### Scenario: Display segmented control style buttons
- **WHEN** 팀원이 팀 상세 페이지에 접근한다
- **THEN** 헤더에 둥근 모서리의 세그먼트 컨트롤 스타일 버튼이 표시된다
- **AND** 왼쪽에 "팀 설정" 텍스트 버튼이 있다
- **AND** 오른쪽에 "..." 아이콘 버튼이 있다

#### Scenario: Navigate to settings from button
- **WHEN** 사용자가 "팀 설정" 버튼을 클릭한다
- **THEN** `/team/[code]/settings` 페이지로 이동한다

#### Scenario: Share team from ellipsis button
- **WHEN** 사용자가 "..." 버튼을 클릭한다
- **THEN** 팀 링크(`https://[domain]/team/[code]`)가 클립보드에 복사된다
- **AND** "팀 링크가 복사되었습니다" 토스트가 표시된다

### Requirement: Team info section displays gender above average age
팀 홈 탭의 팀 정보 섹션에서 성별이 평균 나이 위에 표시되어야 하고, 웹사이트 항목은 제거되어야 한다.

#### Scenario: Team info items in correct order
- **WHEN** 사용자가 팀 홈 탭을 조회한다
- **THEN** 팀 정보 항목이 다음 순서로 표시된다: 지역, 홈 구장, 모임 시간, 성별, 평균 나이, 멤버, 레벨
- **AND** 웹사이트 항목은 표시되지 않는다

#### Scenario: Display gender with appropriate label
- **WHEN** 팀의 team_gender가 설정되어 있다
- **THEN** 성별 항목에 해당 값이 표시된다 (MALE: 남성, FEMALE: 여성, MIXED: 혼성)

### Requirement: Meeting time format without weekly prefix
모임 시간 표시에서 "매주" 접두사가 제거되고 시간 사이에 공백이 추가되어야 한다.

#### Scenario: Display meeting time in new format
- **WHEN** 팀의 정기 운동 정보가 설정되어 있다 (regularDay, regularStartTime, regularEndTime)
- **THEN** 모임 시간이 "[요일]요일 [시작시간] ~ [종료시간]" 형식으로 표시된다
- **예시**: "토요일 01:30 ~ 02:30"

#### Scenario: Display meeting time without end time
- **WHEN** regularEndTime이 null이다
- **THEN** 모임 시간이 "[요일]요일 [시작시간]" 형식으로 표시된다
- **예시**: "토요일 01:30"

## ADDED Requirements

### Requirement: Fix pending members query ordering
가입 대기자 목록 조회 시 존재하지 않는 created_at 대신 id로 정렬해야 한다.

#### Scenario: Query pending members with valid ordering
- **WHEN** getPendingMembers 함수가 호출된다
- **THEN** team_members 테이블에서 status='PENDING'인 레코드를 조회한다
- **AND** id 컬럼 기준 오름차순으로 정렬한다 (created_at 컬럼은 존재하지 않음)
