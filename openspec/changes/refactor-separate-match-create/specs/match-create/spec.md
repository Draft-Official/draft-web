## ADDED Requirements

### Requirement: Match Create Feature Module

`match-create` feature는 호스트가 새로운 농구 경기를 생성하는 기능을 담당하는 독립 모듈이어야 하며, 표준 feature 구조를 따라야 한다(SHALL).

#### Scenario: Feature 구조

- **WHEN** 개발자가 `src/features/match-create/` 폴더를 확인하면
- **THEN** 다음 레이어가 존재해야 한다:
  - `api/` - React Query mutations, queries, keys
  - `ui/` - 경기 생성 폼 컴포넌트들
  - `model/` - Zod 스키마 및 타입 정의
  - `config/` - 상수 및 설정값
  - `index.ts` - 배럴 export

#### Scenario: API 레이어 책임

- **WHEN** `match-create/api/` 레이어를 사용하면
- **THEN** 다음 기능을 제공해야 한다:
  - `useCreateMatch` mutation hook
  - `useMyRecentMatches` query hook (최근 경기 불러오기용)
  - `matchCreateKeys` query key factory

### Requirement: Match Create Form

경기 생성 폼은 호스트가 경기 정보를 입력할 수 있는 단일 페이지 폼을 제공해야 한다(MUST).

#### Scenario: 기본 정보 입력

- **WHEN** 호스트가 경기 생성 폼에 접근하면
- **THEN** 다음 정보를 입력할 수 있어야 한다:
  - 날짜 (14일 이내)
  - 장소 (카카오맵 검색)
  - 시간 및 시간 길이
  - 참가비

#### Scenario: 모집 설정

- **WHEN** 호스트가 모집 인원을 설정하면
- **THEN** 두 가지 모드 중 선택할 수 있어야 한다:
  - 포지션별 모집 (가드/포워드/센터/빅맨)
  - 무관 모집 (총 인원만)

#### Scenario: 경기 스펙 설정

- **WHEN** 호스트가 경기 스펙을 설정하면
- **THEN** 다음 옵션을 선택할 수 있어야 한다:
  - 경기 유형 (5vs5, 3vs3)
  - 성별 (남자, 여자, 혼성)
  - 레벨
  - 연령대
  - 준비물 (실내화, 상하의)

#### Scenario: 최근 경기 불러오기

- **WHEN** 호스트가 "최근 경기 불러오기" 버튼을 클릭하면
- **THEN** 이전에 생성한 경기 목록이 표시되고
- **AND** 선택한 경기의 정보가 폼에 자동 입력되어야 한다 (날짜 제외)

### Requirement: Feature 의존성 규칙

`match-create` feature는 아키텍처 규칙에 따라 의존성을 관리해야 한다(SHALL).

#### Scenario: 허용된 의존성

- **WHEN** `match-create` feature가 다른 모듈을 import하면
- **THEN** `@/shared/**`만 import할 수 있어야 한다
- **AND** 다른 feature (`@/features/match`, `@/features/auth` 등)를 직접 import하면 안 된다

#### Scenario: 공유 리소스 사용

- **WHEN** `match-create`가 인증 정보나 팀 정보가 필요하면
- **THEN** `@/shared/api/`를 통해 Supabase 클라이언트에 접근해야 한다
- **AND** 필요한 서비스는 컴포넌트 내에서 직접 생성해야 한다
