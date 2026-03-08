export const DESKTOP_SIDEBAR_EXPANDED_MIN_WIDTH = 1224;

export function isSidebarCompactForDesktopWidth(width: number): boolean {
  return width < DESKTOP_SIDEBAR_EXPANDED_MIN_WIDTH;
}
