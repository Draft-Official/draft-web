## ADDED Requirements

### Requirement: Team creation with unique code
시스템은 사용자가 팀을 생성할 때 고유한 팀 코드를 입력받아야 한다 (URL 라우트로 사용).

#### Scenario: Successful team creation
- **WHEN** 사용자가 유효한 팀 정보(이름, 코드, 소개)를 입력하고 생성 버튼을 클릭
- **THEN** 시스템은 teams 테이블에 새 레코드를 생성하고, 생성자를 team_members에 LEADER로 추가

#### Scenario: Duplicate code rejection
- **WHEN** 사용자가 이미 존재하는 팀 코드를 입력
- **THEN** 시스템은 "이미 사용 중인 코드입니다" 오류를 표시

#### Scenario: Invalid code format rejection
- **WHEN** 사용자가 유효하지 않은 코드 형식을 입력 (대문자, 특수문자, 3자 미만 등)
- **THEN** 시스템은 "영문 소문자, 숫자, 하이픈만 사용 가능 (3-30자)" 오류를 표시

### Requirement: Team code validation rules
팀 코드는 반드시 다음 규칙을 따라야 한다: 영문 소문자, 숫자, 하이픈만 허용, 3-30자 길이.

#### Scenario: Valid code accepted
- **WHEN** 사용자가 "gangnam-warriors" 형식의 코드를 입력
- **THEN** 시스템은 코드를 유효한 것으로 처리

#### Scenario: Code with uppercase rejected
- **WHEN** 사용자가 "GangnamWarriors" 형식의 코드를 입력
- **THEN** 시스템은 유효성 검사 실패 처리

### Requirement: Team profile with short intro and description
팀은 짧은 소개(100자 이내)와 상세 설명을 가질 수 있다.

#### Scenario: Short intro display for guests
- **WHEN** 비팀원이 팀 페이지에 접근
- **THEN** 시스템은 팀 이름, 로고, 짧은 소개, 활동 지역을 표시

#### Scenario: Full description for team members
- **WHEN** 팀원이 팀 페이지에 접근
- **THEN** 시스템은 전체 팀 정보(소개, 설명, 정기 운동 시간 등)를 표시

### Requirement: Regular schedule configuration
팀은 정기 운동 요일(regular_day)과 시간(regular_time)을 설정할 수 있다.

#### Scenario: Regular schedule setup
- **WHEN** 팀장이 정기 운동 시간을 "매주 화요일 20:00"으로 설정
- **THEN** 시스템은 regular_day='TUE', regular_time='20:00'으로 저장

#### Scenario: Auto-fill on team match creation
- **WHEN** 팀장이 "이번 주 운동 생성" 버튼을 클릭
- **THEN** 시스템은 정기 운동 시간을 기준으로 날짜/시간을 자동 입력

### Requirement: Team page routing by code
시스템은 `/team/[code]` 형식의 URL로 팀 페이지에 접근할 수 있어야 한다.

#### Scenario: Access team by code
- **WHEN** 사용자가 `/team/gangnam-warriors` URL로 접근
- **THEN** 시스템은 해당 코드의 팀 페이지를 표시

#### Scenario: Non-existent code handling
- **WHEN** 사용자가 존재하지 않는 팀 코드로 접근
- **THEN** 시스템은 404 페이지를 표시

### Requirement: Team update by leader or manager
팀장 또는 매니저만 팀 정보를 수정할 수 있다.

#### Scenario: Leader updates team info
- **WHEN** 팀장이 팀 소개를 수정
- **THEN** 시스템은 변경 사항을 저장

#### Scenario: Member update rejected
- **WHEN** 일반 팀원이 팀 정보 수정을 시도
- **THEN** 시스템은 권한 없음 오류를 반환
