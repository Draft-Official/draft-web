import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();

function read(relativePath) {
  return readFileSync(join(rootDir, relativePath), 'utf8');
}

test('indexed search-facing copy does not use outdated mercenary terminology', () => {
  const indexedFiles = [
    'src/features/my/ui/terms-page-view.tsx',
    'src/features/my/ui/faq-list.tsx',
    'public/terms-of-service.md',
  ];

  const offenders = indexedFiles.filter((relativePath) => read(relativePath).includes('용병'));

  assert.deepEqual(offenders, []);
});

test('legal pages export noindex metadata', () => {
  const termsPage = read('app/(main)/my/terms/page.tsx');
  const privacyPage = read('app/(main)/my/privacy/page.tsx');

  assert.match(termsPage, /createNoindexMetadata/);
  assert.match(privacyPage, /createNoindexMetadata/);
});

test('sitemap excludes noindex legal pages', () => {
  const sitemap = read('app/sitemap.ts');

  assert.doesNotMatch(sitemap, /\/my\/terms/);
  assert.doesNotMatch(sitemap, /\/my\/privacy/);
});
