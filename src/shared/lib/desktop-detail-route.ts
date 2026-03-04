export const DESKTOP_DETAIL_QUERY_KEY = 'detail';

export function decodeDesktopDetailRoute(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(value);
    return decoded.startsWith('/') ? decoded : null;
  } catch {
    return null;
  }
}

export function encodeDesktopDetailRoute(routePath: string): string {
  return encodeURIComponent(routePath);
}
