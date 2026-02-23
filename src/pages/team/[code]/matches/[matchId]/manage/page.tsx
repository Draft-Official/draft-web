'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { useAuth } from '@/shared/session';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { useTeamByCode } from '@/features/team/api/team-info/queries';
import { useMyMembership } from '@/features/team/api/membership/queries';
import { useTeamMatch } from '@/features/team/api/match/queries';
import { TeamMatchDetailView } from '@/features/team/ui/components/match/team-match-detail-view';

interface TeamMatchManagePageProps {
  params: Promise<{ code: string; matchId: string }>;
}

// 팀운동 관리 페이지 (DB 연동)
export default function TeamMatchManagePage({ params }: TeamMatchManagePageProps) {
  const { code, matchId: matchIdentifier } = use(params);
  const { user, isLoading: isAuthLoading } = useAuth();

  const { data: team, isLoading: isTeamLoading } = useTeamByCode(code);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (!team) {
    notFound();
  }

  if (!membership) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
        <h2 className="text-xl font-bold text-slate-900 mb-2">접근 권한이 없습니다</h2>
        <p className="text-sm text-slate-500 text-center">
          팀운동 관리는 팀원만 접근할 수 있습니다.
        </p>
      </div>
    );
  }

  const isLeader = membership.role === 'LEADER';
  const isManager = membership.role === 'MANAGER';
  const canManage = isLeader || isManager;

  if (!canManage) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
        <h2 className="text-xl font-bold text-slate-900 mb-2">접근 권한이 없습니다</h2>
        <p className="text-sm text-slate-500 text-center">
          팀운동 관리는 리더/매니저만 접근할 수 있습니다.
        </p>
      </div>
    );
  }

  if (!match || match.teamId !== team.id) {
    notFound();
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
    />
  );
}
