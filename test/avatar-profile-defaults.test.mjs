import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();

function read(relativePath) {
  return readFileSync(join(rootDir, relativePath), 'utf8');
}

function handleNewUserBlock(fileContents) {
  const match = fileContents.match(/handle_new_user[\s\S]*?(?:\$\$ language|\$\$;)/i);
  return match?.[0] ?? '';
}

test('new-user SQL defaults to built-in avatar instead of Kakao avatar', () => {
  const schema = handleNewUserBlock(read('supabase/schema.sql'));
  const baseline = handleNewUserBlock(read('supabase/migrations/20260308191000_baseline_public_schema.sql'));

  for (const fileBlock of [schema, baseline]) {
    assert.match(fileBlock, /avatar_source/i);
    assert.match(fileBlock, /\bnull\b/i);
    assert.doesNotMatch(fileBlock, /raw_user_meta_data->>'avatar_url'/);
  }
});

test('avatar-source backfill migration exists', () => {
  const migrationNames = readdirSync(join(rootDir, 'supabase/migrations'));
  assert.ok(
    migrationNames.some((fileName) => fileName.includes('avatar_source')),
    'expected an avatar_source migration file'
  );
});

test('my-page profile contracts no longer depend on weight', () => {
  const files = [
    'src/features/my/model/types.ts',
    'src/features/my/ui/profile-card.tsx',
    'src/features/my/ui/profile-setup-modal.tsx',
    'src/features/my/lib/mappers.ts',
  ];

  for (const relativePath of files) {
    assert.doesNotMatch(read(relativePath), /weight|몸무게/);
  }
});

test('my-page profile updates persist avatar source explicitly', () => {
  const myPage = read('src/pages/my/page.tsx');
  const sessionTypes = read('src/shared/session/types.ts');

  assert.match(myPage, /avatarSource|avatar_source/);
  assert.match(sessionTypes, /avatar_source/);
});
