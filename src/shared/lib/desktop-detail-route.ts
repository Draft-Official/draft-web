export const DESKTOP_DETAIL_QUERY_KEY = 'detail';
export const DESKTOP_SPLIT_MEDIA_QUERY = '(min-width: 1024px)';

interface BuildDesktopDetailQueryUrlOptions {
  basePath: string;
  currentQueryString?: string | null;
  detailPath: string | null;
}

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

export function buildDesktopDetailQueryUrl({
  basePath,
  currentQueryString,
  detailPath,
}: BuildDesktopDetailQueryUrlOptions): string {
  const nextParams = new URLSearchParams(currentQueryString ?? '');

  if (detailPath) {
    nextParams.set(DESKTOP_DETAIL_QUERY_KEY, encodeDesktopDetailRoute(detailPath));
  } else {
    nextParams.delete(DESKTOP_DETAIL_QUERY_KEY);
  }

  const queryString = nextParams.toString();
  return queryString.length > 0 ? `${basePath}?${queryString}` : basePath;
}
