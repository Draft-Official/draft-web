import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDesktopDetailQueryUrl } from './desktop-detail-route';

test('buildDesktopDetailQueryUrl sets encoded detail query', () => {
  const nextUrl = buildDesktopDetailQueryUrl({
    basePath: '/schedule',
    currentQueryString: 'view=host',
    detailPath: '/matches/abc-123?from=schedule',
  });

  assert.equal(
    nextUrl,
    '/schedule?view=host&detail=%252Fmatches%252Fabc-123%253Ffrom%253Dschedule'
  );
});

test('buildDesktopDetailQueryUrl removes detail query while preserving others', () => {
  const nextUrl = buildDesktopDetailQueryUrl({
    basePath: '/team',
    currentQueryString: 'view=schedule&detail=%2Fteam%2FTM01%2Fmatches%2Fm1&page=2',
    detailPath: null,
  });

  assert.equal(nextUrl, '/team?view=schedule&page=2');
});

test('buildDesktopDetailQueryUrl returns base path when no params remain', () => {
  const nextUrl = buildDesktopDetailQueryUrl({
    basePath: '/team/TM01',
    currentQueryString: 'detail=%2Fteam%2FTM01%2Fmatches%2Fm1',
    detailPath: null,
  });

  assert.equal(nextUrl, '/team/TM01');
});
