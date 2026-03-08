import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DESKTOP_SIDEBAR_EXPANDED_MIN_WIDTH,
  isSidebarCompactForDesktopWidth,
} from './sidebar-layout';

test('isSidebarCompactForDesktopWidth returns true below expanded breakpoint', () => {
  assert.equal(isSidebarCompactForDesktopWidth(1024), true);
  assert.equal(
    isSidebarCompactForDesktopWidth(DESKTOP_SIDEBAR_EXPANDED_MIN_WIDTH - 1),
    true
  );
});

test('isSidebarCompactForDesktopWidth returns false at and above expanded breakpoint', () => {
  assert.equal(
    isSidebarCompactForDesktopWidth(DESKTOP_SIDEBAR_EXPANDED_MIN_WIDTH),
    false
  );
  assert.equal(isSidebarCompactForDesktopWidth(1600), false);
});
