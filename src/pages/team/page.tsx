'use client';

import { TeamPageTabs } from '@/features/team';
import { TeamRouteDetailPanel } from '@/features/team/ui/components/match/team-route-detail-panel';
import { LoginRequiredBlock } from '@/features/auth';
import { useDesktopDetailRoute } from '@/shared/lib/hooks';
import { useAuth } from '@/shared/session';
import { DesktopSplitView } from '@/shared/ui/layout';
import { Spinner } from '@/shared/ui/shadcn/spinner';

export default function TeamPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const {
    isSplitMode,
    selectedDetailPath,
    navigateToDetail,
    closeDetail,
  } = useDesktopDetailRoute({ basePath: '/team' });

  const handleTeamMatchSelect = (detailPath: string) => {
    navigateToDetail(detailPath);
  };

  const handleSplitClose = () => {
    closeDetail();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginRequiredBlock description="로그인하고 다양한 기능을 이용해보세요." redirectTo="/team" />;
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
        <TeamRouteDetailPanel
          routePath={selectedDetailPath}
          onClose={handleSplitClose}
          emptyMessage="왼쪽 목록에서 경기를 선택해 주세요."
        />
      }
    />
  );
}
