-- ============================================
-- Teams RLS Policies + FK 수정
-- 팀 생성/수정/삭제 권한 관리
-- 멱등(idempotent) - 중복 실행 안전
-- ============================================

-- ============================================
-- 0. matches.team_id FK를 SET NULL로 변경
-- 팀 삭제 시 매치는 유지하고 team_id만 NULL로
-- ============================================
ALTER TABLE matches
  DROP CONSTRAINT IF EXISTS matches_team_id_fkey;

ALTER TABLE matches
  ADD CONSTRAINT matches_team_id_fkey
  FOREIGN KEY (team_id) REFERENCES teams(id)
  ON DELETE SET NULL;

-- ============================================
-- 1. RLS 정책
-- ============================================

-- RLS 활성화
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "All Public Teams" ON teams;
DROP POLICY IF EXISTS "All Public Teams Insert" ON teams;
DROP POLICY IF EXISTS "teams_select" ON teams;
DROP POLICY IF EXISTS "teams_insert" ON teams;
DROP POLICY IF EXISTS "teams_update" ON teams;
DROP POLICY IF EXISTS "teams_delete" ON teams;

-- ============================================
-- 1. SELECT: 로그인한 사용자는 모든 팀 조회 가능
-- ============================================
CREATE POLICY "teams_select"
  ON teams FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 2. INSERT: 로그인한 사용자는 팀 생성 가능
-- ============================================
CREATE POLICY "teams_insert"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 3. UPDATE: 팀장만 팀 정보 수정 가능
-- ============================================
CREATE POLICY "teams_update"
  ON teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'ACCEPTED'
        AND team_members.role IN ('LEADER')
    )
  );

-- ============================================
-- 4. DELETE: 팀장만 팀 삭제 가능
-- ============================================
CREATE POLICY "teams_delete"
  ON teams FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'ACCEPTED'
        AND team_members.role = 'LEADER'
    )
  );
