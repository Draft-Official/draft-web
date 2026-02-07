-- ============================================
-- Team Schema Extension Migration
-- teams 테이블 확장, applications 확장, team_fees 테이블 생성
-- 멱등(idempotent) - 중복 실행 안전
-- ============================================

-- ============================================
-- 1. teams 테이블 확장
-- ============================================

-- 1.1 code 컬럼 추가 (팀 고유 코드, URL 라우트용)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS code VARCHAR(30) UNIQUE;

-- 1.2 short_intro 컬럼 추가 (게스트에게 노출되는 짧은 소개)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS short_intro VARCHAR(100);

-- 1.3 regular_day 컬럼 추가 (정기 운동 요일: MON, TUE, WED, THU, FRI, SAT, SUN)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS regular_day VARCHAR(3) CHECK (regular_day IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'));

-- 1.4 regular_time 컬럼 추가 (정기 운동 시간)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS regular_time TIME;

-- 1.5 code 유효성 검사 제약조건 (영문 소문자, 숫자, 하이픈만 허용, 3-30자)
DO $$ BEGIN
  ALTER TABLE teams ADD CONSTRAINT teams_code_format_check
    CHECK (code ~ '^[a-z0-9-]{3,30}$');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1.6 code 컬럼 인덱스 (조회 최적화)
CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(code);

-- ============================================
-- 2. applications 테이블 확장
-- ============================================

-- 2.1 source 컬럼 추가 (GUEST_APPLICATION | TEAM_VOTE 구분)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'GUEST_APPLICATION'
  CHECK (source IN ('GUEST_APPLICATION', 'TEAM_VOTE'));

-- 2.2 description 컬럼 추가 (불참/늦음 사유 입력)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS description TEXT;

-- 2.3 source 컬럼 인덱스 (팀 투표 조회용)
CREATE INDEX IF NOT EXISTS idx_applications_source ON applications(source);

-- 2.4 팀 투표 조회용 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_applications_team_vote
  ON applications(match_id, source)
  WHERE source = 'TEAM_VOTE';

-- ============================================
-- 3. team_fees 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS team_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year_month VARCHAR(7) NOT NULL,  -- '2026-02' 형식
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMPTZ,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id, year_month)
);

-- 3.1 team_fees 인덱스
CREATE INDEX IF NOT EXISTS idx_team_fees_team_month
  ON team_fees(team_id, year_month);

CREATE INDEX IF NOT EXISTS idx_team_fees_user
  ON team_fees(user_id);

-- 3.2 team_fees updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_team_fees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_team_fees_updated_at ON team_fees;
CREATE TRIGGER trg_team_fees_updated_at
  BEFORE UPDATE ON team_fees
  FOR EACH ROW
  EXECUTE FUNCTION update_team_fees_updated_at();

-- ============================================
-- 4. team_fees RLS 정책
-- ============================================

ALTER TABLE team_fees ENABLE ROW LEVEL SECURITY;

-- SELECT: 해당 팀의 팀원만 조회 가능
DO $$ BEGIN
  CREATE POLICY "team_fees_select"
    ON team_fees FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = team_fees.team_id
          AND team_members.user_id = auth.uid()
          AND team_members.status = 'ACCEPTED'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- INSERT: 팀장/매니저만 생성 가능
DO $$ BEGIN
  CREATE POLICY "team_fees_insert"
    ON team_fees FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = team_fees.team_id
          AND team_members.user_id = auth.uid()
          AND team_members.status = 'ACCEPTED'
          AND team_members.role IN ('LEADER', 'MANAGER')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- UPDATE: 팀장/매니저만 수정 가능
DO $$ BEGIN
  CREATE POLICY "team_fees_update"
    ON team_fees FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = team_fees.team_id
          AND team_members.user_id = auth.uid()
          AND team_members.status = 'ACCEPTED'
          AND team_members.role IN ('LEADER', 'MANAGER')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = team_fees.team_id
          AND team_members.user_id = auth.uid()
          AND team_members.status = 'ACCEPTED'
          AND team_members.role IN ('LEADER', 'MANAGER')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- DELETE: 팀장만 삭제 가능
DO $$ BEGIN
  CREATE POLICY "team_fees_delete"
    ON team_fees FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = team_fees.team_id
          AND team_members.user_id = auth.uid()
          AND team_members.status = 'ACCEPTED'
          AND team_members.role = 'LEADER'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 5. team_members 테이블 확장 (REJECTED 상태 지원)
-- ============================================

-- team_members.status에 REJECTED 값이 허용되도록 확인
-- (PostgreSQL에서는 CHECK 제약조건이 없다면 이미 허용됨)
-- 명시적으로 status 컬럼에 대한 CHECK 추가 (없다면)
DO $$
BEGIN
  -- 기존 제약조건 제거 시도 (없으면 무시)
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'team_members_status_check'
  ) THEN
    ALTER TABLE team_members DROP CONSTRAINT team_members_status_check;
  END IF;

  -- 새 제약조건 추가
  ALTER TABLE team_members ADD CONSTRAINT team_members_status_check
    CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 6. 기존 데이터 마이그레이션
-- ============================================

-- 6.1 기존 teams에 code가 없는 경우 UUID 기반으로 임시 생성
-- (code는 영문 소문자, 숫자, 하이픈만 허용이므로 UUID에서 하이픈 제거 후 소문자로)
UPDATE teams
SET code = CONCAT('team-', LOWER(REPLACE(SUBSTRING(id::text, 1, 8), '-', '')))
WHERE code IS NULL;

-- 6.2 기존 applications에 source 설정
UPDATE applications
SET source = 'GUEST_APPLICATION'
WHERE source IS NULL;

-- ============================================
-- 7. matches 테이블에 voting_closed 컬럼 추가 (팀 투표 마감용)
-- ============================================

ALTER TABLE matches ADD COLUMN IF NOT EXISTS voting_closed_at TIMESTAMPTZ;

-- ============================================
-- 8. 팀 관련 추가 인덱스
-- ============================================

-- 팀 매치 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_matches_team_match
  ON matches(team_id, start_time)
  WHERE match_type = 'TEAM_MATCH';
