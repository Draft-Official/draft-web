# Capability: Match Data Model

이 스펙은 matches 테이블의 경기 유형/방식 데이터 모델을 정의합니다.

## MODIFIED Requirements

### Requirement: match_type은 경기 목적을 저장해야 한다

match_type 컬럼은 경기의 목적(용병 모집, 픽업게임 등)을 나타내는 ENUM 값을 저장해야 합니다 (MUST).

허용 값: GUEST_RECRUIT, PICKUP_GAME, TUTORIAL, LESSON, TOURNAMENT

#### Scenario: 용병 모집 매치 생성 시 match_type이 GUEST_RECRUIT으로 저장된다

**Given** 호스트가 매치 생성 폼을 작성했을 때
**When** 매치를 저장하면
**Then** match_type 컬럼에 'GUEST_RECRUIT' 값이 저장된다

#### Scenario: match_type의 기본값은 GUEST_RECRUIT이다

**Given** match_type 값이 명시되지 않은 매치 INSERT 요청이 있을 때
**When** 매치가 생성되면
**Then** match_type은 'GUEST_RECRUIT'으로 설정된다

---

## ADDED Requirements

### Requirement: match_format은 경기 방식을 저장해야 한다

match_format 컬럼은 경기 인원 방식(5vs5, 3vs3)을 나타내는 ENUM 값을 저장해야 합니다 (MUST).

허용 값: FIVE_ON_FIVE, THREE_ON_THREE

#### Scenario: 5vs5 매치 생성 시 match_format이 FIVE_ON_FIVE로 저장된다

**Given** 호스트가 매치 생성 폼에서 5vs5를 선택했을 때
**When** 매치를 저장하면
**Then** match_format 컬럼에 'FIVE_ON_FIVE' 값이 저장된다

#### Scenario: 3vs3 매치 생성 시 match_format이 THREE_ON_THREE로 저장된다

**Given** 호스트가 매치 생성 폼에서 3vs3를 선택했을 때
**When** 매치를 저장하면
**Then** match_format 컬럼에 'THREE_ON_THREE' 값이 저장된다

#### Scenario: match_format의 기본값은 FIVE_ON_FIVE이다

**Given** match_format 값이 명시되지 않은 매치 INSERT 요청이 있을 때
**When** 매치가 생성되면
**Then** match_format은 'FIVE_ON_FIVE'로 설정된다

---

### Requirement: 기존 match_type 데이터가 match_format으로 마이그레이션되어야 한다

기존에 match_type에 저장된 '5vs5', '3vs3' 값은 새로운 match_format 컬럼으로 변환되어 저장되어야 합니다 (SHALL).

#### Scenario: 기존 '5vs5' 값이 'FIVE_ON_FIVE'로 마이그레이션된다

**Given** 기존 매치의 match_type이 '5vs5'일 때
**When** 마이그레이션이 실행되면
**Then** match_format은 'FIVE_ON_FIVE'로 설정되고
**And** match_type은 'GUEST_RECRUIT'으로 변경된다

#### Scenario: 기존 '3vs3' 값이 'THREE_ON_THREE'로 마이그레이션된다

**Given** 기존 매치의 match_type이 '3vs3'일 때
**When** 마이그레이션이 실행되면
**Then** match_format은 'THREE_ON_THREE'로 설정되고
**And** match_type은 'GUEST_RECRUIT'으로 변경된다
