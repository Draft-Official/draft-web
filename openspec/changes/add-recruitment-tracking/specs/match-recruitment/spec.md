## ADDED Requirements

### Requirement: RecruitmentSetup Data Structure
모집 설정은 `recruitment_setup` JSONB 필드에 통합 관리되어야 한다(MUST).

#### Scenario: ANY 타입 데이터 구조
- **WHEN** 포지션 무관 모집을 설정할 때
- **THEN** `recruitment_setup`은 다음 구조를 가져야 한다:
  ```json
  {
    "type": "ANY",
    "max_count": 5,
    "current_count": 0
  }
  ```
- **AND** `current_count`는 기본값 0으로 초기화되어야 한다

#### Scenario: POSITION 타입 데이터 구조
- **WHEN** 포지션별 모집을 설정할 때
- **THEN** `recruitment_setup`은 다음 구조를 가져야 한다:
  ```json
  {
    "type": "POSITION",
    "positions": {
      "G": { "max": 2, "current": 0 },
      "F": { "max": 2, "current": 0 },
      "C": { "max": 1, "current": 0 }
    }
  }
  ```
- **AND** 각 포지션의 `current`는 기본값 0으로 초기화되어야 한다

#### Scenario: 빅맨 통합 모드 데이터 구조
- **WHEN** 빅맨(F/C) 통합 모집을 설정할 때
- **THEN** `recruitment_setup`은 다음 구조를 가져야 한다:
  ```json
  {
    "type": "POSITION",
    "positions": {
      "G": { "max": 2, "current": 0 },
      "B": { "max": 3, "current": 0 }
    }
  }
  ```

### Requirement: Recruitment Count Auto-Update
시스템은 신청 상태 변경 시 해당 매치의 모집 현황을 자동으로 업데이트해야 한다(MUST).

#### Scenario: POSITION 타입에서 신청 확정 시 current 증가
- **WHEN** 게스트 신청이 CONFIRMED 상태로 변경될 때
- **AND** recruitment_setup.type이 'POSITION'일 때
- **AND** 해당 신청의 participants_info에 포지션 정보가 있을 때
- **THEN** `recruitment_setup.positions[position].current` 값이 참여자 수만큼 증가해야 한다

#### Scenario: ANY 타입에서 신청 확정 시 current_count 증가
- **WHEN** 게스트 신청이 CONFIRMED 상태로 변경될 때
- **AND** recruitment_setup.type이 'ANY'일 때
- **THEN** `recruitment_setup.current_count` 값이 참여자 수만큼 증가해야 한다

#### Scenario: 신청 취소 시 current 감소
- **WHEN** 확정된 게스트 신청이 CANCELED 상태로 변경될 때
- **THEN** 해당 타입에 맞는 current 값이 참여자 수만큼 감소해야 한다
- **AND** current 값은 0 미만으로 내려가지 않아야 한다

### Requirement: Match Create/Edit Format Validation
매치 생성 및 수정 시 올바른 recruitment_setup 형식을 보장해야 한다(MUST).

#### Scenario: 매치 생성 시 초기값 설정
- **WHEN** 호스트가 새 매치를 생성할 때
- **THEN** recruitment_setup의 모든 current 값은 0으로 초기화되어야 한다
- **AND** max 값은 호스트가 설정한 값이어야 한다

#### Scenario: 매치 수정 시 current 값 보존
- **WHEN** 호스트가 기존 매치의 모집 인원을 수정할 때
- **THEN** 기존 current 값은 보존되어야 한다
- **AND** max 값만 변경되어야 한다

#### Scenario: 모집 모드 변경 시 current 초기화
- **WHEN** 호스트가 모집 모드를 변경할 때 (ANY ↔ POSITION)
- **THEN** current 값은 0으로 초기화되어야 한다
- **AND** 경고 메시지를 표시해야 한다

### Requirement: Deprecate current_players_count
`matches.current_players_count` 필드는 더 이상 사용하지 않아야 한다(MUST).

#### Scenario: 신규 코드에서 current_players_count 미사용
- **WHEN** 현재 모집 인원을 조회할 때
- **THEN** `recruitment_setup`에서 값을 읽어야 한다
- **AND** `current_players_count` 필드를 참조하지 않아야 한다

#### Scenario: 기존 데이터 마이그레이션
- **WHEN** 기존 매치에 `current_players_count` 값이 있고 `recruitment_setup.current_count`가 없을 때
- **THEN** `current_players_count` 값을 `recruitment_setup.current_count`로 마이그레이션해야 한다

### Requirement: Recruitment Status Display
호스트와 게스트는 포지션별 모집 현황을 실시간으로 확인할 수 있어야 한다(SHALL).

#### Scenario: 호스트 경기 상세에서 모집 현황 확인
- **WHEN** 호스트가 경기 상세 화면을 볼 때
- **THEN** 각 포지션별 현재/최대 인원(current/max)을 표시해야 한다
- **AND** 프로그레스바로 시각적 진행률을 보여줘야 한다

#### Scenario: 게스트 신청 시 가용 자리 확인
- **WHEN** 게스트가 경기 신청 화면에 접근할 때
- **THEN** 각 포지션별 남은 자리 수(max - current)를 표시할 수 있어야 한다

### Requirement: Data Consistency
모집 인원 데이터는 일관성을 유지해야 한다(MUST).

#### Scenario: current 값이 max 초과 허용
- **WHEN** current 값이 max를 초과할 수 있는 상황일 때 (추가 모집 등)
- **THEN** 시스템은 이를 허용해야 한다
- **AND** UI에서 초과 상태를 명확히 표시해야 한다
