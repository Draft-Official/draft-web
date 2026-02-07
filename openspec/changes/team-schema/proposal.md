## Why

Phase 2 팀 시스템 구현을 위한 데이터베이스 스키마 확장이 필요하다. 현재 `teams`와 `team_members` 테이블이 존재하지만, 팀 운동 생성/투표, 회비 관리 등 핵심 기능을 지원하기 위한 컬럼과 테이블이 부족하다. 팀 매치는 기존 `matches` 테이블을, 팀 투표는 기존 `applications` 테이블을 확장하여 일관된 데이터 모델을 유지한다.

## What Changes

### teams 테이블 확장
- `code` 컬럼 추가: 팀 고유 코드 (URL 라우트로 사용, unique, 예: `/team/slam-dunk`)
- `short_intro` 컬럼 추가: 게스트에게 노출되는 짧은 팀 소개 (100자 이내)
- `description` 컬럼 추가: 팀 상세 설명 (긴 텍스트)
- `regular_schedule` → `regular_day` + `regular_time` 분리: 팀 매치 생성 시 자동 입력용

### team_members 테이블 확장
- `status`에 `REJECTED` 값 추가: 가입 거절 상태 추적

### applications 테이블 확장
- `source` 컬럼 추가: `GUEST_APPLICATION` | `TEAM_VOTE` 구분
- `application_status` enum에 `NOT_ATTENDING` 추가: 팀 투표 불참 표시
- `description` 컬럼 추가: 불참/늦음 사유 입력 (선택)
- 팀 탭에서 투표 시 application 레코드 생성 (자동 생성 X)

### team_fees 테이블 신규 생성
- 팀 월별 회비 납부 여부 체크용 테이블
- 컬럼: `team_id`, `user_id`, `year_month`, `is_paid`, `paid_at`, `updated_by`

### matches 테이블 활용
- `match_type = 'TEAM_MATCH'` 값 사용 (이미 준비됨)
- `team_id` 연결로 팀 매치 식별

## Capabilities

### New Capabilities
- `team-management`: 팀 생성, 수정, 조회, 삭제 및 팀 프로필 관리
- `team-membership`: 팀 초대, 가입 신청, 승인/거절, 팀원 관리, 역할 체계
- `team-match`: 팀 정기운동 생성, 팀원 투표 시스템, 경기관리 연동
- `team-fees`: 팀 월별 회비 납부 현황 관리

### Modified Capabilities
- (없음 - 기존 specs 디렉토리 비어있음)

## Impact

### 데이터베이스
- `teams` 테이블: 3개 컬럼 추가, 1개 컬럼 분리
- `team_members` 테이블: status 값 추가
- `applications` 테이블: 1개 컬럼 추가, enum 값 추가
- `team_fees` 테이블: 신규 생성
- 마이그레이션 SQL 필요

### API Layer
- `src/features/team/` 디렉토리 생성 필요
  - `api/`: team-api.ts, team-mapper.ts, queries.ts, mutations.ts
  - `model/`: types.ts
  - `ui/`: 팀 관련 컴포넌트들

### 라우팅
- `/team/[code]`: 팀 코드 기반 동적 라우트 (UUID 대신 사용자 친화적 URL)
- 예: `/team/slam-dunk`, `/team/gangnam-warriors`

### 기존 코드 영향
- `src/features/schedule/`: 팀 매치 상태 표시 로직 추가 필요
- `src/features/application/`: source 컬럼 및 NOT_ATTENDING 상태 처리
- `src/shared/types/`: 팀 관련 타입 정의

### RLS 정책
- `team_fees` 테이블 RLS 정책 추가 필요
- 팀원만 팀 내부 정보 조회 가능하도록 정책 업데이트
