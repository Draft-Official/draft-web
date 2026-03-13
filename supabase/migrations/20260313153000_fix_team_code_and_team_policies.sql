BEGIN;

-- Keep legacy team codes editable until the code itself changes.
ALTER TABLE public.teams
  DROP CONSTRAINT IF EXISTS teams_code_format_check;

CREATE OR REPLACE FUNCTION public.trg_teams_code_validate()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.code IS NOT NULL AND NEW.code !~ '^[A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ]{1,15}$' THEN
    RAISE EXCEPTION 'Invalid team code: %', NEW.code
      USING ERRCODE = '23514',
            MESSAGE = 'team code must contain only Korean characters, letters, or digits and be 15 characters or fewer';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "trg_teams_code_validate" ON public.teams;
CREATE OR REPLACE TRIGGER "trg_teams_code_validate"
  BEFORE INSERT OR UPDATE OF "code" ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_teams_code_validate();

DROP POLICY IF EXISTS "teams_select" ON public.teams;
CREATE POLICY "teams_select" ON public.teams
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "teams_update" ON public.teams;
CREATE POLICY "teams_update" ON public.teams
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE team_members.team_id = teams.id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'ACCEPTED'
        AND team_members.role = 'LEADER'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE team_members.team_id = teams.id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'ACCEPTED'
        AND team_members.role = 'LEADER'
    )
  );

DROP POLICY IF EXISTS "team_members_select" ON public.team_members;
CREATE POLICY "team_members_select" ON public.team_members
  FOR SELECT
  USING (status = 'ACCEPTED' OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "team_members_update_by_leader" ON public.team_members;
CREATE POLICY "team_members_update_by_leader" ON public.team_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'ACCEPTED'
        AND tm.role = 'LEADER'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'ACCEPTED'
        AND tm.role = 'LEADER'
    )
  );

DROP POLICY IF EXISTS "team_members_update_by_manager" ON public.team_members;
CREATE POLICY "team_members_update_by_manager" ON public.team_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'ACCEPTED'
        AND tm.role = 'MANAGER'
    )
    AND role NOT IN ('LEADER', 'MANAGER')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'ACCEPTED'
        AND tm.role = 'MANAGER'
    )
    AND role NOT IN ('LEADER', 'MANAGER')
  );

DROP POLICY IF EXISTS "team_members_update_reapply_self" ON public.team_members;
CREATE POLICY "team_members_update_reapply_self" ON public.team_members
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status = 'REJECTED'
    AND role = 'MEMBER'
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'PENDING'
    AND role = 'MEMBER'
  );

DROP POLICY IF EXISTS "deny_all" ON public.team_fees;
DROP POLICY IF EXISTS "team_fees_select" ON public.team_fees;
DROP POLICY IF EXISTS "team_fees_insert" ON public.team_fees;
DROP POLICY IF EXISTS "team_fees_update" ON public.team_fees;
DROP POLICY IF EXISTS "team_fees_delete" ON public.team_fees;

CREATE POLICY "team_fees_select" ON public.team_fees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE team_members.team_id = team_fees.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'ACCEPTED'
    )
  );

CREATE POLICY "team_fees_insert" ON public.team_fees
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE team_members.team_id = team_fees.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'ACCEPTED'
        AND team_members.role IN ('LEADER', 'MANAGER')
    )
  );

CREATE POLICY "team_fees_update" ON public.team_fees
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE team_members.team_id = team_fees.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'ACCEPTED'
        AND team_members.role IN ('LEADER', 'MANAGER')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE team_members.team_id = team_fees.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'ACCEPTED'
        AND team_members.role IN ('LEADER', 'MANAGER')
    )
  );

CREATE POLICY "team_fees_delete" ON public.team_fees
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE team_members.team_id = team_fees.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'ACCEPTED'
        AND team_members.role = 'LEADER'
    )
  );

COMMIT;
