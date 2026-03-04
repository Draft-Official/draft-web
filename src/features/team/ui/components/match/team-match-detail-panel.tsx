'use client';

import { useAuth } from '@/shared/session';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { useTeamByCode } from '@/features/team/api/team-info/queries';
import { useMyMembership } from '@/features/team/api/membership/queries';
import { useTeamMatch } from '@/features/team/api/match/queries';
import { TeamMatchDetailView } from './team-match-detail-view';

interface TeamMatchDetailPanelProps {
  teamCode: string;
  matchIdentifier: string;
  mode?: 'view' | 'manage';
  onClose?: () => void;
  layoutMode?: 'page' | 'split';
}

export function TeamMatchDetailPanel({
  teamCode,
  matchIdentifier,
  mode = 'view',
  onClose,
  layoutMode = 'page',
}: TeamMatchDetailPanelProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: team, isLoading: isTeamLoading } = useTeamByCode(teamCode);
  const { data: membership, isLoading: isMembershipLoading } = useMyMembership(
    team?.id,
    user?.id
  );

  const teamIdForMatchQuery = membership ? team?.id : null;
  const { data: match, isLoading: isMatchLoading } = useTeamMatch(
    matchIdentifier,
    teamIdForMatchQuery
  );

  if (isAuthLoading || isTeamLoading || isMembershipLoading || isMatchLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-lg font-bold text-slate-900 mb-2">팀을 찾을 수 없습니다</h2>
        <p className="text-sm text-slate-500">팀 코드가 올바른지 확인해주세요.</p>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-lg font-bold text-slate-900 mb-2">접근 권한이 없습니다</h2>
        <p className="text-sm text-slate-500">팀 운동 상세는 팀원만 볼 수 있습니다.</p>
      </div>
    );
  }

  if (!match || match.teamId !== team.id) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-lg font-bold text-slate-900 mb-2">경기를 찾을 수 없습니다</h2>
        <p className="text-sm text-slate-500">경기 정보가 없거나 접근 권한이 없습니다.</p>
      </div>
    );
  }

  if (mode === 'manage') {
    const isLeader = membership.role === 'LEADER';
    const isManager = membership.role === 'MANAGER';
    const canManage = isLeader || isManager;

    if (!canManage) {
      return (
        <div className="h-full flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">접근 권한이 없습니다</h2>
          <p className="text-sm text-slate-500">팀운동 관리는 리더/매니저만 접근할 수 있습니다.</p>
        </div>
      );
    }

    return (
      <TeamMatchDetailView
        match={match}
        team={team}
        membership={membership}
        userId={user?.id}
        showVoteAction={false}
        showExtraSections={false}
        canQuickAddGuest={true}
        onBack={onClose}
        layoutMode={layoutMode}
      />
    );
  }

  return (
    <TeamMatchDetailView
      match={match}
      team={team}
      membership={membership}
      userId={user?.id}
      canQuickAddGuest={true}
      onBack={onClose}
      layoutMode={layoutMode}
    />
  );
}
