'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMediaQuery } from './use-media-query';
import {
  DESKTOP_DETAIL_QUERY_KEY,
  DESKTOP_SPLIT_MEDIA_QUERY,
  buildDesktopDetailQueryUrl,
  decodeDesktopDetailRoute,
} from '@/shared/lib/desktop-detail-route';

interface UseDesktopDetailRouteOptions {
  basePath: string;
}

interface UpdateDetailQueryOptions {
  replace?: boolean;
}

export function useDesktopDetailRoute({ basePath }: UseDesktopDetailRouteOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery(DESKTOP_SPLIT_MEDIA_QUERY);
  const selectedDetailPath = decodeDesktopDetailRoute(
    searchParams?.get(DESKTOP_DETAIL_QUERY_KEY) ?? null
  );
  const isSplitMode = isDesktop && !!selectedDetailPath;

  useEffect(() => {
    if (!selectedDetailPath || typeof window === 'undefined') {
      return;
    }

    const isDesktopViewport = window.matchMedia(DESKTOP_SPLIT_MEDIA_QUERY).matches;
    if (!isDesktopViewport) {
      router.replace(selectedDetailPath);
    }
  }, [router, selectedDetailPath]);

  const updateDetailQuery = useCallback((
    detailPath: string | null,
    options?: UpdateDetailQueryOptions
  ) => {
    const nextUrl = buildDesktopDetailQueryUrl({
      basePath,
      currentQueryString: searchParams?.toString() ?? '',
      detailPath,
    });

    if (options?.replace) {
      router.replace(nextUrl, { scroll: false });
      return;
    }

    router.push(nextUrl, { scroll: false });
  }, [basePath, router, searchParams]);

  const navigateToDetail = useCallback((detailPath: string) => {
    if (isDesktop) {
      updateDetailQuery(detailPath);
      return;
    }

    router.push(detailPath);
  }, [isDesktop, router, updateDetailQuery]);

  const closeDetail = useCallback(() => {
    updateDetailQuery(null, { replace: true });
  }, [updateDetailQuery]);

  return {
    isDesktop,
    isSplitMode,
    selectedDetailPath,
    updateDetailQuery,
    navigateToDetail,
    closeDetail,
  };
}
