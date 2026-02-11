## ADDED Requirements

### Requirement: Pending members page displays join requests
가입 신청 관리 페이지(`/team/[code]/members/pending`)에서 대기 중인 가입 신청 목록이 표시되어야 한다. 이 페이지는 LEADER 또는 MANAGER 역할을 가진 사용자만 접근할 수 있다.

#### Scenario: Display pending join requests
- **WHEN** LEADER/MANAGER가 가입 신청 관리 페이지에 접근한다
- **THEN** PENDING 상태인 가입 신청 목록이 표시된다
- **AND** 각 항목에는 신청자의 프로필(닉네임, 아바타, 포지션)이 표시된다

#### Scenario: Empty state when no pending requests
- **WHEN** 대기 중인 가입 신청이 없다
- **THEN** "가입 신청이 없습니다" 메시지가 표시된다

#### Scenario: Access denied for regular members
- **WHEN** MEMBER 역할의 사용자가 가입 신청 관리 페이지에 접근한다
- **THEN** 접근 권한 없음 메시지가 표시된다

### Requirement: Approve join request
LEADER/MANAGER가 가입 신청을 승인할 수 있어야 한다.

#### Scenario: Approve a join request
- **WHEN** LEADER/MANAGER가 가입 신청의 "수락" 버튼을 클릭한다
- **THEN** 해당 멤버십의 status가 ACCEPTED로 변경된다
- **AND** joined_at이 현재 시간으로 설정된다
- **AND** "가입을 승인했습니다" 토스트가 표시된다
- **AND** 해당 항목이 목록에서 제거된다

### Requirement: Reject join request
LEADER/MANAGER가 가입 신청을 거절할 수 있어야 한다.

#### Scenario: Reject a join request
- **WHEN** LEADER/MANAGER가 가입 신청의 "거절" 버튼을 클릭한다
- **THEN** 해당 멤버십의 status가 REJECTED로 변경된다
- **AND** "가입을 거절했습니다" 토스트가 표시된다
- **AND** 해당 항목이 목록에서 제거된다

### Requirement: Navigate from members tab to pending page
멤버 탭에서 대기 중인 가입 신청이 있을 때 가입 신청 관리 페이지로 이동할 수 있어야 한다.

#### Scenario: Navigate to pending page from badge
- **WHEN** LEADER/MANAGER가 멤버 탭의 "가입 대기 N명" 영역을 클릭한다
- **THEN** `/team/[code]/members/pending` 페이지로 이동한다
