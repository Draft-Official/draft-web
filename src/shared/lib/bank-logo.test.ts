import assert from 'node:assert/strict';
import test from 'node:test';

// @ts-expect-error Node test runner loads TypeScript files with explicit extension.
import { getBankBadgeText, getBankLogoPath } from './bank-logo.ts';

test('getBankLogoPath returns official path for configured bank', () => {
  assert.equal(getBankLogoPath('KB국민은행'), '/banks/official/kb-kookmin-fill.png');
});

test('getBankLogoPath returns null for unconfigured bank', () => {
  assert.equal(getBankLogoPath('산림조합'), null);
});

test('getBankLogoPath returns path for extended bank mappings', () => {
  assert.equal(getBankLogoPath('SC제일은행'), '/banks/official/sc-standard-fill.png');
  assert.equal(getBankLogoPath('대구은행'), '/banks/official/im-bank-fill.png');
});

test('getBankBadgeText returns english prefix when it exists', () => {
  assert.equal(getBankBadgeText('KB국민은행'), 'KB');
});

test('getBankBadgeText falls back to first character for korean names', () => {
  assert.equal(getBankBadgeText('신한은행'), '신');
});
