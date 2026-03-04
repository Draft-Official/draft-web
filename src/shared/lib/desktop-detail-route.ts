export const DESKTOP_DETAIL_QUERY_KEY = 'detail';

export function isSafeDesktopDetailRoutePath(routePath: string): boolean {
  if (!routePath.startsWith('/')) {
    return false;
  }

  if (routePath.startsWith('//')) {
    return false;
  }

  if (routePath.includes('\\')) {
    return false;
  }

  return !routePath.includes('\r') && !routePath.includes('\n');
}

export function decodeDesktopDetailRoute(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(value);
    return isSafeDesktopDetailRoutePath(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

export function encodeDesktopDetailRoute(routePath: string): string {
  return encodeURIComponent(routePath);
}
