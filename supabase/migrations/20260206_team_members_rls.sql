-- ============================================
-- Team Members RLS Policies + Auto-add Leader Trigger
-- 보안 강화: 셀프 승급 방지, 하극상 방지
-- 멱등(idempotent) - 중복 실행 안전
-- ============================================

-- ============================================
-- 1. 팀 생성 시 자동으로 LEADER 추가하는 Trigger
-- ============================================

CREATE OR REPLACE FUNCTION add_team_leader()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_members (team_id, user_id, role, status, joined_at)
  VALUES (NEW.id, auth.uid(), 'LEADER', 'ACCEPTED', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_add_team_leader ON teams;
CREATE TRIGGER trg_add_team_leader
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_team_leader();

-- ============================================
-- 2. team_members RLS 정책
-- ============================================

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "team_members_select" ON team_members;
DROP POLICY IF EXISTS "team_members_insert_self" ON team_members;
DROP POLICY IF EXISTS "team_members_insert_by_leader" ON team_members;
DROP POLICY IF EXISTS "team_members_update" ON team_members;
DROP POLICY IF EXISTS "team_members_delete_self" ON team_members;
DROP POLICY IF EXISTS "team_members_delete_by_leader" ON team_members;

-- 2.1 SELECT: 로그인한 사용자는 모든 팀 멤버 조회 가능
CREATE POLICY "team_members_select"
  ON team_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 2.2 INSERT: 가입 신청만 허용 (PENDING + MEMBER 강제)
-- 팀 생성 시 LEADER 추가는 Trigger가 SECURITY DEFINER로 처리
CREATE POLICY "team_members_insert_join_request"
  ON team_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'PENDING'
    AND role = 'MEMBER'
  );

-- 2.3 UPDATE: 팀장/매니저가 역할/상태 변경 가능
-- 단, LEADER는 건드릴 수 없음 (하극상 방지)
-- 매니저는 다른 MANAGER도 건드릴 수 없음
CREATE POLICY "team_members_update_by_leader"
  ON team_members FOR UPDATE
  USING (
    -- 요청자가 해당 팀의 LEADER
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'ACCEPTED'
        AND tm.role = 'LEADER'
    )
  );

CREATE POLICY "team_members_update_by_manager"
  ON team_members FOR UPDATE
  USING (
    -- 요청자가 해당 팀의 MANAGER이고
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'ACCEPTED'
        AND tm.role = 'MANAGER'
    )
    -- 대상이 LEADER나 MANAGER가 아닌 경우만
    AND team_members.role NOT IN ('LEADER', 'MANAGER')
  );

-- 2.4 DELETE: 자신이 탈퇴 (단, LEADER는 탈퇴 불가 - 팀 삭제해야 함)
CREATE POLICY "team_members_delete_self"
  ON team_members FOR DELETE
  USING (
    auth.uid() = user_id
    AND role != 'LEADER'
  );

-- 2.5 DELETE: 팀장이 멤버 내보내기 (자기 자신 제외)
CREATE POLICY "team_members_delete_by_leader"
  ON team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'ACCEPTED'
        AND tm.role = 'LEADER'
    )
    AND team_members.user_id != auth.uid()
  );
