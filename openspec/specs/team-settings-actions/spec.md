## ADDED Requirements

### Requirement: Team profile edit page
팀 프로필 수정 페이지(`/team/[code]/settings/edit`)에서 팀 정보를 수정할 수 있어야 한다. LEADER만 접근 가능하다.

#### Scenario: Display team profile edit form
- **WHEN** LEADER가 팀 프로필 수정 페이지에 접근한다
- **THEN** 현재 팀 정보가 폼에 미리 채워져 표시된다
- **AND** 수정 가능한 필드: 팀 이름, 한줄 소개, 팀 소개, 로고, 지역, 홈 구장, 정기 운동 요일/시간, 성별, 레벨 범위, 나이 범위

#### Scenario: Save team profile changes
- **WHEN** LEADER가 정보를 수정하고 "저장" 버튼을 클릭한다
- **THEN** 팀 정보가 업데이트된다
- **AND** "팀 정보가 수정되었습니다" 토스트가 표시된다
- **AND** 팀 설정 페이지로 이동한다

#### Scenario: Validation error on save
- **WHEN** 필수 필드(팀 이름)가 비어있는 상태로 저장을 시도한다
- **THEN** 유효성 검사 오류가 표시된다
- **AND** 저장되지 않는다

### Requirement: Refund account edit dialog
환불 계좌 수정 다이얼로그에서 팀의 환불 계좌 정보를 수정할 수 있어야 한다. LEADER만 사용 가능하다.

#### Scenario: Open account edit dialog
- **WHEN** LEADER가 팀 설정의 "환불 계좌" 항목의 "수정" 버튼을 클릭한다
- **THEN** 환불 계좌 수정 다이얼로그가 열린다
- **AND** 현재 계좌 정보(은행명, 계좌번호, 예금주)가 표시된다

#### Scenario: Save account info
- **WHEN** LEADER가 계좌 정보를 입력하고 "저장" 버튼을 클릭한다
- **THEN** 팀의 account_info가 업데이트된다
- **AND** 다이얼로그가 닫힌다
- **AND** "계좌 정보가 수정되었습니다" 토스트가 표시된다

### Requirement: Delegate leadership dialog
팀 소유자 위임 다이얼로그에서 팀장 권한을 다른 멤버에게 이전할 수 있어야 한다. LEADER만 사용 가능하다.

#### Scenario: Open delegate dialog
- **WHEN** LEADER가 "팀 소유자 위임" 메뉴를 클릭한다
- **THEN** 팀 소유자 위임 다이얼로그가 열린다
- **AND** ACCEPTED 상태인 팀원 목록이 표시된다 (본인 제외)

#### Scenario: Select new leader and confirm
- **WHEN** LEADER가 새 팀장을 선택하고 "위임" 버튼을 클릭한다
- **THEN** 확인 다이얼로그가 표시된다: "정말 [닉네임]님에게 팀장 권한을 위임하시겠습니까?"

#### Scenario: Complete leadership transfer
- **WHEN** LEADER가 확인 다이얼로그에서 "확인"을 클릭한다
- **THEN** 기존 LEADER의 role이 MEMBER로 변경된다
- **AND** 선택한 멤버의 role이 LEADER로 변경된다
- **AND** "팀장 권한이 위임되었습니다" 토스트가 표시된다
- **AND** 팀 상세 페이지로 이동한다

### Requirement: Delete team with confirmation
팀 삭제 기능은 확인 다이얼로그를 통해 LEADER만 실행할 수 있어야 한다.

#### Scenario: Delete team confirmation
- **WHEN** LEADER가 "팀 삭제하기" 메뉴를 클릭한다
- **THEN** 삭제 확인 다이얼로그가 표시된다
- **AND** 경고 메시지: "팀을 삭제하면 모든 팀원과 경기 기록이 영구적으로 삭제됩니다"

#### Scenario: Complete team deletion
- **WHEN** LEADER가 삭제 확인 다이얼로그에서 "삭제"를 클릭한다
- **THEN** 팀이 삭제된다
- **AND** "팀이 삭제되었습니다" 토스트가 표시된다
- **AND** `/team` 페이지로 이동한다
