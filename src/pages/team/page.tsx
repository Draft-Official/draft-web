'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TeamPageTabs } from '@/features/team';
import { DESKTOP_DETAIL_QUERY_KEY, decodeDesktopDetailRoute, encodeDesktopDetailRoute } from '@/shared/lib/desktop-detail-route';
import { useMediaQuery } from '@/shared/lib/hooks/use-media-query';
import { useAuth } from '@/shared/session';
import { DesktopRouteDetailPanel, DesktopSplitView } from '@/shared/ui/layout';
import { Spinner } from '@/shared/ui/shadcn/spinner';

export default function TeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { isLoading, isAuthenticated } = useAuth();
  const selectedDetailPath = decodeDesktopDetailRoute(
    searchParams?.get(DESKTOP_DETAIL_QUERY_KEY) ?? null
  );
  const isSplitMode = isDesktop && !!selectedDetailPath;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login?redirect=/team');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!selectedDetailPath || typeof window === 'undefined') {
      return;
    }

    const isDesktopViewport = window.matchMedia('(min-width: 1024px)').matches;

    if (!isDesktopViewport) {
      router.replace(selectedDetailPath);
    }
  }, [selectedDetailPath, router]);

  const updateDetailQuery = (detailPath: string | null, useReplace = false) => {
    const nextParams = new URLSearchParams(searchParams?.toString() ?? '');

    if (detailPath) {
      nextParams.set(DESKTOP_DETAIL_QUERY_KEY, encodeDesktopDetailRoute(detailPath));
    } else {
      nextParams.delete(DESKTOP_DETAIL_QUERY_KEY);
    }

    const queryString = nextParams.toString();
    const nextUrl = queryString.length > 0 ? `/team?${queryString}` : '/team';

    if (useReplace) {
      router.replace(nextUrl, { scroll: false });
      return;
    }

    router.push(nextUrl, { scroll: false });
  };

  const handleTeamMatchSelect = (detailPath: string) => {
    if (isDesktop) {
      updateDetailQuery(detailPath);
      return;
    }

    router.push(detailPath);
  };

  const handleSplitClose = () => {
    updateDetailQuery(null, true);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <DesktopSplitView
      enabled={isSplitMode}
      listContent={
        <TeamPageTabs
          onTeamMatchSelect={handleTeamMatchSelect}
          activeTeamMatchPath={isSplitMode ? selectedDetailPath : null}
        />
      }
      detailContent={
        <DesktopRouteDetailPanel
          routePath={selectedDetailPath}
          onClose={handleSplitClose}
          emptyMessage="왼쪽 목록에서 경기를 선택해 주세요."
        />
      }
    />
  );
}
