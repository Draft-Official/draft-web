## ADDED Requirements

### Requirement: Team invite link generation
팀장/매니저는 팀 초대 링크를 생성하고 공유할 수 있다.

#### Scenario: Generate invite link
- **WHEN** 팀장이 "초대 링크 복사" 버튼을 클릭
- **THEN** 시스템은 `/team/[code]/join` 형식의 초대 링크를 클립보드에 복사

#### Scenario: Share invite link
- **WHEN** 사용자가 초대 링크로 접속
- **THEN** 시스템은 팀 정보와 함께 "가입 신청" 버튼을 표시

### Requirement: Team join request
사용자는 초대 링크를 통해 팀 가입을 신청할 수 있다.

#### Scenario: Submit join request
- **WHEN** 로그인한 사용자가 초대 링크에서 "가입 신청" 버튼을 클릭
- **THEN** 시스템은 team_members에 status='PENDING' 레코드를 생성

#### Scenario: Duplicate join request prevention
- **WHEN** 이미 가입 신청한 사용자가 다시 신청
- **THEN** 시스템은 "이미 가입 신청 중입니다" 메시지를 표시

#### Scenario: Already member notification
- **WHEN** 이미 팀원인 사용자가 초대 링크로 접속
- **THEN** 시스템은 "이미 팀원입니다" 메시지를 표시하고 팀 페이지로 이동

### Requirement: Join request approval/rejection
팀장/매니저는 가입 신청을 승인하거나 거절할 수 있다.

#### Scenario: Approve join request
- **WHEN** 팀장이 가입 신청자의 "승인" 버튼을 클릭
- **THEN** 시스템은 status를 'ACCEPTED'로 변경하고 joined_at을 설정

#### Scenario: Reject join request
- **WHEN** 팀장이 가입 신청자의 "거절" 버튼을 클릭
- **THEN** 시스템은 status를 'REJECTED'로 변경

### Requirement: Team member role management
팀장은 팀원의 역할을 변경할 수 있다 (LEADER, MANAGER, MEMBER).

#### Scenario: Promote member to manager
- **WHEN** 팀장이 일반 팀원을 "매니저로 지정" 클릭
- **THEN** 시스템은 해당 팀원의 role을 'MANAGER'로 변경

#### Scenario: Demote manager to member
- **WHEN** 팀장이 매니저를 "일반 팀원으로 변경" 클릭
- **THEN** 시스템은 해당 팀원의 role을 'MEMBER'로 변경

#### Scenario: Only leader can manage roles
- **WHEN** 매니저가 다른 팀원의 역할을 변경하려고 시도
- **THEN** 시스템은 권한 없음 오류를 반환

### Requirement: Team member removal
팀장/매니저는 팀원을 강퇴할 수 있다.

#### Scenario: Remove team member
- **WHEN** 팀장이 팀원의 "강퇴" 버튼을 클릭
- **THEN** 시스템은 해당 team_members 레코드를 삭제

#### Scenario: Cannot remove leader
- **WHEN** 누군가 팀장을 강퇴하려고 시도
- **THEN** 시스템은 "팀장은 강퇴할 수 없습니다" 오류를 반환

### Requirement: Team member voluntary leave
팀원은 자발적으로 팀을 탈퇴할 수 있다.

#### Scenario: Member leaves team
- **WHEN** 팀원이 "팀 탈퇴" 버튼을 클릭하고 확인
- **THEN** 시스템은 해당 team_members 레코드를 삭제

#### Scenario: Leader cannot leave without transfer
- **WHEN** 팀장이 팀 탈퇴를 시도
- **THEN** 시스템은 "팀장 권한을 다른 팀원에게 넘긴 후 탈퇴하세요" 메시지를 표시

### Requirement: Role-based team page view
팀 페이지는 사용자 역할에 따라 다른 뷰를 표시한다.

#### Scenario: Guest view (non-member)
- **WHEN** 비팀원이 팀 페이지에 접근
- **THEN** 시스템은 팀 프로필(이름, 소개, 활동 지역)과 "가입 신청" 버튼만 표시

#### Scenario: Member view
- **WHEN** 팀원이 팀 페이지에 접근
- **THEN** 시스템은 팀 정보, 다가오는 운동(투표 UI), 회비 현황을 표시

#### Scenario: Leader/Manager view
- **WHEN** 팀장/매니저가 팀 페이지에 접근
- **THEN** 시스템은 전체 정보와 함께 관리 기능(운동 생성, 가입 승인, 팀원 관리, 회비 체크)을 표시

### Requirement: Multiple team membership
사용자는 여러 팀에 가입할 수 있다.

#### Scenario: Join multiple teams
- **WHEN** 이미 팀A에 가입한 사용자가 팀B에 가입 신청
- **THEN** 시스템은 정상적으로 팀B 가입 신청을 처리

#### Scenario: View my teams
- **WHEN** 여러 팀에 가입한 사용자가 "내 팀" 메뉴에 접근
- **THEN** 시스템은 가입된 모든 팀 목록을 표시
