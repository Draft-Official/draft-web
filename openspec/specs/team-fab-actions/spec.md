## ADDED Requirements

### Requirement: FAB displays action menu
팀 상세 페이지에서 FAB(Floating Action Button)를 클릭하면 액션 메뉴가 표시되어야 한다. FAB는 팀원(MEMBER, MANAGER, LEADER) 역할을 가진 사용자에게만 표시된다.

#### Scenario: FAB visible for team members
- **WHEN** 팀원 역할을 가진 사용자가 팀 상세 페이지에 접근한다
- **THEN** 화면 우측 하단에 FAB가 표시된다

#### Scenario: FAB hidden for non-members
- **WHEN** 팀원이 아닌 사용자가 팀 상세 페이지에 접근한다
- **THEN** FAB가 표시되지 않는다

#### Scenario: FAB opens action menu
- **WHEN** 사용자가 FAB를 클릭한다
- **THEN** Popover 형태로 액션 메뉴가 FAB 위에 표시된다
- **AND** 메뉴에는 "경기 생성하기", "링크로 멤버 초대하기" 옵션이 포함된다

### Requirement: Create match action navigates to match creation
FAB 메뉴에서 "경기 생성하기"를 선택하면 팀 매치 생성 페이지로 이동해야 한다.

#### Scenario: Navigate to match creation
- **WHEN** 사용자가 "경기 생성하기" 옵션을 클릭한다
- **THEN** `/team/[code]/match/create` 페이지로 이동한다

### Requirement: Invite member action copies invite link
FAB 메뉴에서 "링크로 멤버 초대하기"를 선택하면 팀 초대 링크가 클립보드에 복사되어야 한다.

#### Scenario: Copy invite link to clipboard
- **WHEN** 사용자가 "링크로 멤버 초대하기" 옵션을 클릭한다
- **THEN** 팀 초대 링크(`https://[domain]/team/[code]`)가 클립보드에 복사된다
- **AND** "초대 링크가 복사되었습니다" 토스트 메시지가 표시된다

#### Scenario: Clipboard copy fails gracefully
- **WHEN** 클립보드 복사가 실패한다 (브라우저 권한 등)
- **THEN** "링크 복사에 실패했습니다" 에러 토스트가 표시된다
