import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();
const migrationPath = 'supabase/migrations/20260313153000_fix_team_code_and_team_policies.sql';

function read(relativePath) {
  return readFileSync(join(rootDir, relativePath), 'utf8');
}

test('team code regex allows only Korean, letters, and digits within 15 chars', () => {
  const constants = read('src/shared/config/team-constants.ts');
  const maxLengthMatch = constants.match(/export const TEAM_CODE_MAX_LENGTH = (\d+);/);
  const regexMatch = constants.match(/export const TEAM_CODE_REGEX = \/(.+)\/;/);

  assert.ok(maxLengthMatch, 'TEAM_CODE_MAX_LENGTH constant is missing');
  assert.ok(regexMatch, 'TEAM_CODE_REGEX constant is missing');
  assert.equal(Number(maxLengthMatch[1]), 15);

  const regex = new RegExp(regexMatch[1]);

  assert.equal(regex.test('드래프트'), true);
  assert.equal(regex.test('Draft2026'), true);
  assert.equal(regex.test('TEAM코드123'), true);
  assert.equal(regex.test('가나다라마바사아자차카'), true);

  assert.equal(regex.test('team code'), false);
  assert.equal(regex.test('team-code'), false);
  assert.equal(regex.test('team_code'), false);
  assert.equal(regex.test('team!'), false);
  assert.equal(regex.test('abcdefghijklmnop'), false);
});

test('team code helper copy is shown on create and edit forms', () => {
  const createStep = read('src/features/team/ui/components/team-create-step-info.tsx');
  const editSection = read('src/features/team/ui/components/edit/basic-info-section.tsx');

  for (const file of [createStep, editSection]) {
    assert.match(file, /(DRAFT 팀페이지 주소로 이용됩니다\.|TEAM_CODE_PREVIEW_LABEL)/);
    assert.match(file, /(https:\/\/draftmatch\.kr\/team\/|TEAM_CODE_PREVIEW_BASE_URL)/);
    assert.match(file, /text-primary/);
  }
});

test('latest migration updates team code constraint and team-related RLS policies', () => {
  assert.equal(
    existsSync(join(rootDir, migrationPath)),
    true,
    `Expected migration file to exist: ${migrationPath}`
  );

  const migration = read(migrationPath);

  assert.match(
    migration,
    /CREATE POLICY "teams_select" ON public\.teams[\s\S]*USING \(true\);/
  );
  assert.match(
    migration,
    /CREATE POLICY "team_members_select" ON public\.team_members[\s\S]*status = 'ACCEPTED'[\s\S]*auth\.uid\(\) IS NOT NULL/
  );
  assert.match(
    migration,
    /CREATE POLICY "team_members_update_reapply_self" ON public\.team_members[\s\S]*FOR UPDATE/
  );
  assert.match(
    migration,
    /DROP POLICY IF EXISTS "deny_all" ON public\.team_fees;/
  );
  assert.match(
    migration,
    /CREATE POLICY "team_fees_select" ON public\.team_fees[\s\S]*FOR SELECT/
  );
  assert.match(
    migration,
    /DROP CONSTRAINT IF EXISTS teams_code_format_check;/
  );
  assert.match(
    migration,
    /CREATE OR REPLACE FUNCTION public\.trg_teams_code_validate\(\)/
  );
  assert.match(
    migration,
    /NEW\.code !~ '\^\[A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\]\{1,15\}\$'/
  );
  assert.match(
    migration,
    /CREATE OR REPLACE TRIGGER "trg_teams_code_validate"[\s\S]*BEFORE INSERT OR UPDATE OF "code" ON public\.teams/
  );
});
