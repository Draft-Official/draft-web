## ADDED Requirements

### Requirement: Monthly fee status tracking
팀장/매니저는 팀원별 월별 회비 납부 여부를 체크할 수 있다.

#### Scenario: Mark fee as paid
- **WHEN** 팀장이 특정 팀원의 2월 회비를 "납부 완료"로 체크
- **THEN** 시스템은 team_fees 테이블에 is_paid=true, paid_at=현재시간, updated_by=팀장ID로 저장

#### Scenario: Mark fee as unpaid
- **WHEN** 팀장이 이미 납부 완료된 회비를 "미납"으로 변경
- **THEN** 시스템은 is_paid=false, paid_at=null로 업데이트

#### Scenario: Only leader/manager can manage fees
- **WHEN** 일반 팀원이 회비 상태 변경을 시도
- **THEN** 시스템은 권한 없음 오류를 반환

### Requirement: Fee status display for members
팀원은 자신의 회비 납부 현황을 확인할 수 있다.

#### Scenario: View own fee status
- **WHEN** 팀원이 팀 페이지에서 회비 현황 섹션 접근
- **THEN** 시스템은 자신의 월별 납부 상태(납부/미납)를 표시

#### Scenario: View fee summary
- **WHEN** 팀장이 회비 관리 페이지 접근
- **THEN** 시스템은 "12명 중 10명 납부" 형식의 요약과 팀원별 상태를 표시

### Requirement: Fee records per month
회비 기록은 년-월 단위로 관리된다.

#### Scenario: Create fee record for new month
- **WHEN** 팀장이 2026년 2월 회비 관리 시작
- **THEN** 시스템은 year_month='2026-02'로 각 팀원의 fee 레코드를 생성 (기본값 is_paid=false)

#### Scenario: View historical fee status
- **WHEN** 팀장이 이전 달 회비 현황 조회
- **THEN** 시스템은 해당 월의 납부 기록을 표시

### Requirement: Fee status initialization for team members
새로운 팀원 또는 새로운 월에 대해 fee 레코드가 필요 시 생성된다.

#### Scenario: New member fee record
- **WHEN** 새로운 팀원이 가입하고 회비 관리 페이지에 표시
- **THEN** 시스템은 해당 팀원의 현재 월 fee 레코드를 is_paid=false로 생성

#### Scenario: Member leaves before payment
- **WHEN** 팀원이 회비 미납 상태에서 탈퇴
- **THEN** 시스템은 기존 fee 레코드를 유지 (히스토리용)

### Requirement: Fee account information
팀은 회비 입금 계좌 정보를 설정할 수 있다.

#### Scenario: Display fee account
- **WHEN** 팀원이 회비 현황 페이지 접근
- **THEN** 시스템은 팀의 회비 계좌 정보(은행, 계좌번호, 예금주)를 표시

#### Scenario: Copy account number
- **WHEN** 팀원이 계좌번호 복사 버튼 클릭
- **THEN** 시스템은 계좌번호를 클립보드에 복사
