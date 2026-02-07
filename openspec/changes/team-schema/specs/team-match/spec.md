## ADDED Requirements

### Requirement: Team match creation
팀장/매니저는 팀 운동(TEAM_MATCH)을 생성할 수 있다.

#### Scenario: Create team match with auto-fill
- **WHEN** 팀장이 "이번 주 운동 생성" 버튼을 클릭
- **THEN** 시스템은 팀의 정기 운동 정보(요일, 시간, 홈구장)를 자동으로 채운 매치 생성 폼을 표시

#### Scenario: Team match stored in matches table
- **WHEN** 팀장이 팀 운동 생성을 완료
- **THEN** 시스템은 matches 테이블에 match_type='TEAM_MATCH', team_id=해당팀ID로 레코드를 생성

#### Scenario: Only leader/manager can create
- **WHEN** 일반 팀원이 팀 운동 생성을 시도
- **THEN** 시스템은 권한 없음 오류를 반환

### Requirement: Team voting in team tab
팀원은 팀 탭에서 팀 운동에 대해 투표할 수 있다 (참석/불참/미정).

#### Scenario: Vote attendance
- **WHEN** 팀원이 팀 탭에서 "참석" 버튼을 클릭
- **THEN** 시스템은 applications 테이블에 source='TEAM_VOTE', status='CONFIRMED' 레코드를 생성

#### Scenario: Vote not attending with reason
- **WHEN** 팀원이 "불참"을 선택하고 사유 "출장"을 입력
- **THEN** 시스템은 source='TEAM_VOTE', status='NOT_ATTENDING', description='출장' 레코드를 생성

#### Scenario: Vote undecided
- **WHEN** 팀원이 "미정" 버튼을 클릭
- **THEN** 시스템은 source='TEAM_VOTE', status='PENDING' 레코드를 생성

### Requirement: Vote change before deadline
팀원은 투표 마감 전까지 투표를 변경할 수 있다.

#### Scenario: Change vote from not attending to attending
- **WHEN** 불참 투표한 팀원이 "참석"으로 변경
- **THEN** 시스템은 해당 application의 status를 'CONFIRMED'로 업데이트하고 description을 초기화

#### Scenario: Vote change blocked after deadline
- **WHEN** 투표 마감된 팀 운동에 대해 팀원이 투표 변경 시도
- **THEN** 시스템은 "투표가 마감되었습니다" 오류를 표시

### Requirement: Real-time voting status display
팀 탭에서 실시간 투표 현황을 표시한다.

#### Scenario: Display voting summary
- **WHEN** 팀원이 팀 탭에서 팀 운동을 조회
- **THEN** 시스템은 "참석 N명 / 불참 N명 / 미정 N명 / 미응답 N명" 형식으로 표시

#### Scenario: Calculate non-responders
- **WHEN** 팀원 12명 중 8명이 투표
- **THEN** 시스템은 미응답을 4명으로 계산 (팀원 수 - 투표 수)

### Requirement: Vote deadline management
팀장/매니저는 투표를 마감할 수 있다.

#### Scenario: Close voting
- **WHEN** 팀장이 "투표 마감" 버튼을 클릭
- **THEN** 시스템은 해당 매치의 투표를 마감하고 추가 투표/변경을 차단

#### Scenario: Only leader/manager can close
- **WHEN** 일반 팀원이 투표 마감을 시도
- **THEN** 시스템은 권한 없음 오류를 반환

### Requirement: Schedule integration for team match
팀 투표 결과는 경기관리 탭에 반영된다.

#### Scenario: Attendance shows in guest tab
- **WHEN** 팀원이 "참석" 투표 후 경기관리 게스트 탭 접근
- **THEN** 시스템은 해당 팀 운동을 "참여 예정" 상태로 표시

#### Scenario: Not attending shows in guest tab
- **WHEN** 팀원이 "불참" 투표 후 경기관리 게스트 탭 접근
- **THEN** 시스템은 해당 팀 운동을 "불참" 상태로 표시

#### Scenario: Non-voter not shown in schedule
- **WHEN** 팀원이 아직 투표하지 않음
- **THEN** 시스템은 경기관리에 해당 팀 운동을 표시하지 않음

#### Scenario: Leader sees voting status in host tab
- **WHEN** 팀장이 경기관리 호스트 탭에 접근
- **THEN** 시스템은 팀 운동을 "투표중" 또는 "투표 마감" 상태로 표시

### Requirement: Guest recruitment switch
팀장/매니저는 팀 운동을 게스트 모집으로 전환할 수 있다.

#### Scenario: Open guest recruitment
- **WHEN** 팀장이 "남은 자리 게스트 모집" 버튼을 클릭
- **THEN** 시스템은 recruitment_setup을 업데이트하고 메인 게스트 모집 리스트에 노출

#### Scenario: Guest sees team match in main list
- **WHEN** 게스트 모집 전환된 팀 운동
- **THEN** 시스템은 메인 매치 리스트에 팀 이름, 로고와 함께 표시

### Requirement: Application source distinction
게스트 신청과 팀 투표는 source 컬럼으로 구분된다.

#### Scenario: Guest application source
- **WHEN** 외부 게스트가 팀 운동에 신청
- **THEN** 시스템은 source='GUEST_APPLICATION' 레코드를 생성

#### Scenario: Team vote source
- **WHEN** 팀원이 팀 탭에서 투표
- **THEN** 시스템은 source='TEAM_VOTE' 레코드를 생성

#### Scenario: Query by source
- **WHEN** 팀장이 투표 현황 조회
- **THEN** 시스템은 source='TEAM_VOTE'인 레코드만 필터링하여 표시
