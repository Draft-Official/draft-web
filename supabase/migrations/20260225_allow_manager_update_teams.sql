-- ============================================
-- Allow accepted managers to update team records
-- Used for team introduction editing in team detail home tab
-- ============================================

DROP POLICY IF EXISTS "teams_update" ON teams;

CREATE POLICY "teams_update"
  ON teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'ACCEPTED'
        AND team_members.role IN ('LEADER', 'MANAGER')
    )
  );
