## Context

현재 Draft는 게스트 모집(GUEST_RECRUIT) 기능이 완성된 상태이며, Phase 2로 팀 시스템을 구축해야 한다. 기존 `teams`, `team_members` 테이블이 존재하지만 실제 사용되지 않고 있으며, 팀 운동 생성/투표/회비 관리를 위한 확장이 필요하다.

**현재 스키마 상태:**
- `teams`: 기본 필드만 존재 (name, logo_url, region, home_gym_id 등)
- `team_members`: role, status 필드 존재하지만 활용 안 됨
- `matches`: `match_type` 컬럼이 'GUEST_RECRUIT'로 사용 중, 'TEAM_MATCH' 준비됨
- `applications`: 게스트 신청 전용, 팀 투표 지원 안 됨

**제약사항:**
- 기존 게스트 모집 로직에 영향 최소화
- 마이그레이션 시 기존 데이터 보존
- RLS 정책으로 팀원만 내부 정보 접근

## Goals / Non-Goals

**Goals:**
- 팀 생성/수정/조회 및 코드 기반 라우팅 지원
- 팀원 초대/가입/승인/거절/강퇴 플로우 구현
- 팀 매치 생성 및 투표 시스템 (팀 탭에서 투표 → 경기관리 반영)
- 월별 회비 납부 현황 체크 기능

**Non-Goals:**
- 팀 검색 기능 (초대 링크만 지원)
- 자동 매치 생성 (스케줄 기반)
- 실시간 결제 연동 (회비는 수동 체크만)
- 팀 공지사항 히스토리 (host_notice로 대체)
- 팀 간 매치 메이킹

## Decisions

### 1. 팀 코드를 URL 라우트로 사용

**결정:** `teams.code` 컬럼을 unique로 추가하고 `/team/[code]` 라우트로 사용

**대안:**
- UUID 사용 (`/team/550e8400-e29b...`) → 사용자 친화적이지 않음
- 숫자 ID (`/team/123`) → 추측 가능, 보안 약함

**근거:** 사용자가 팀 URL을 공유하기 쉽고, 팀 정체성 표현 가능

**제약:**
- 영문 소문자, 숫자, 하이픈만 허용
- 3-30자 길이 제한
- 중복 불가 (unique constraint)

### 2. 투표 시 Application 레코드 생성

**결정:** 팀 매치 생성 시 자동으로 application을 생성하지 않고, 팀원이 투표할 때 생성

**대안:**
- 팀 매치 생성 시 모든 팀원에게 PENDING 레코드 자동 생성 → 불필요한 데이터 증가, 팀원 변동 시 처리 복잡

**근거:**
- 투표한 사람만 레코드 존재 → 데이터 간결
- "미응답"은 레코드 없음으로 표현 (팀원 수 - 투표 수)
- 팀원 추가/삭제 시 별도 처리 불필요

### 3. Application에 source 컬럼 추가

**결정:** `source` 컬럼으로 게스트 신청과 팀 투표 구분

```
source = 'GUEST_APPLICATION'  -- 게스트가 직접 신청
source = 'TEAM_VOTE'          -- 팀원이 팀 탭에서 투표
```

**대안:**
- 별도 `team_votes` 테이블 생성 → 중복 로직, 경기관리 쿼리 복잡

**근거:** 기존 applications 테이블 재사용으로 일관된 데이터 모델 유지

### 4. Application에 description 컬럼 추가

**결정:** 불참/늦음 사유 입력을 위한 `description` TEXT 컬럼 추가

**근거:** 팀장이 불참 사유를 확인할 수 있어 팀 운영에 도움

### 5. 정기 운동 시간 분리

**결정:** `regular_schedule` (TEXT) → `regular_day` (TEXT) + `regular_time` (TIME) 분리

**근거:** 팀 매치 생성 시 날짜/시간 자동 계산에 필요

```
regular_day = 'TUE'      -- MON, TUE, WED, THU, FRI, SAT, SUN
regular_time = '20:00'   -- HH:MM 형식
```

### 6. 회비 테이블 단순화

**결정:** `team_fees` 테이블에 납부 여부만 저장 (금액, 결제 정보 없음)

**근거:** 실제 결제는 카카오뱅크 등 외부 서비스 사용, 앱에서는 체크만

## Risks / Trade-offs

### [Risk] 팀 코드 중복 체크 레이스 컨디션
- **위험:** 동시에 같은 코드로 팀 생성 시도 시 충돌
- **완화:** DB unique constraint로 최종 방어, UI에서 실시간 중복 체크

### [Risk] 팀원 변동 시 투표 현황 불일치
- **위험:** 투표 후 팀 탈퇴 시 투표 기록 남음
- **완화:** 투표 현황 조회 시 현재 팀원 기준으로 필터링

### [Trade-off] 미응답자 추적 복잡성
- **상황:** 미응답 = 레코드 없음으로 처리
- **영향:** "미응답자 목록"은 팀원 - 투표자로 계산 필요
- **수용:** 데이터 간결성 > 쿼리 편의성

### [Trade-off] application_status enum 확장
- **상황:** `NOT_ATTENDING` 추가로 enum 변경 필요
- **영향:** PostgreSQL enum 변경은 마이그레이션 필요
- **수용:** 타입 안전성 > 마이그레이션 비용

## Migration Plan

### Phase 1: 스키마 마이그레이션

```sql
-- 1. teams 테이블 확장
ALTER TABLE teams ADD COLUMN code VARCHAR(30) UNIQUE;
ALTER TABLE teams ADD COLUMN short_intro VARCHAR(100);
ALTER TABLE teams ADD COLUMN description TEXT;
ALTER TABLE teams ADD COLUMN regular_day VARCHAR(3);  -- MON, TUE, ...
ALTER TABLE teams ADD COLUMN regular_time TIME;

-- 2. applications 테이블 확장
ALTER TABLE applications ADD COLUMN source VARCHAR(20) DEFAULT 'GUEST_APPLICATION';
ALTER TABLE applications ADD COLUMN description TEXT;

-- 3. application_status enum 확장
ALTER TYPE application_status ADD VALUE 'NOT_ATTENDING';

-- 4. team_fees 테이블 생성
CREATE TABLE team_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  year_month VARCHAR(7) NOT NULL,  -- '2026-02'
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id, year_month)
);

-- 5. RLS 정책
ALTER TABLE team_fees ENABLE ROW LEVEL SECURITY;
```

### Phase 2: 기존 데이터 처리

```sql
-- 기존 teams에 code가 없는 경우 UUID 기반으로 임시 생성
UPDATE teams SET code = LOWER(REPLACE(id::text, '-', ''))
WHERE code IS NULL;

-- 기존 applications에 source 설정
UPDATE applications SET source = 'GUEST_APPLICATION'
WHERE source IS NULL;
```

### Rollback Strategy

```sql
-- 컬럼 삭제 (필요시)
ALTER TABLE teams DROP COLUMN code;
ALTER TABLE teams DROP COLUMN short_intro;
ALTER TABLE teams DROP COLUMN description;
ALTER TABLE teams DROP COLUMN regular_day;
ALTER TABLE teams DROP COLUMN regular_time;

ALTER TABLE applications DROP COLUMN source;
ALTER TABLE applications DROP COLUMN description;

DROP TABLE team_fees;

-- enum 값은 롤백 불가 (PostgreSQL 제약)
```

## Open Questions

1. **팀 코드 변경 허용?**
   - 현재: 생성 시 설정, 변경 불가
   - 변경 허용 시 기존 URL 리다이렉트 처리 필요

2. **투표 마감 후 게스트 모집 전환 시 기존 팀원 투표 처리?**
   - 참석 투표한 팀원은 자동으로 확정 참가자로 포함?
   - 별도 recruitment_setup에서 관리?

3. **회비 미납 시 투표 제한?**
   - Phase 2에서는 제한 없음으로 시작
   - 추후 정책 결정 필요
