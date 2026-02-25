'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { useTeamByCode } from '@/features/team/api/team-info/queries';
import { useMyMembership } from '@/features/team/api/membership/queries';
import { useTeamMatch } from '@/features/team/api/match/queries';
import { useAuth } from '@/shared/session';
import { TeamMatchDetailView } from '@/features/team/ui/components/match/team-match-detail-view';
import { Spinner } from '@/shared/ui/shadcn/spinner';

interface TeamMatchDetailPageProps {
  params: Promise<{ code: string; matchId: string }>;
}

export default function TeamMatchDetailPage({ params }: TeamMatchDetailPageProps) {
  const { code, matchId: matchIdentifier } = use(params);
  const { user, isLoading: isAuthLoading } = useAuth();

  // 팀 정보 조회
  const { data: team, isLoading: isTeamLoading } = useTeamByCode(code);

  // 멤버십 조회
  const { data: membership, isLoading: isMembershipLoading } = useMyMembership(
    team?.id,
    user?.id
  );

  // 팀 소속이 확인된 경우에만 팀 매치 상세 조회
  const teamIdForMatchQuery = membership ? team?.id : null;

  // 매치 상세 조회
  const { data: match, isLoading: isMatchLoading } = useTeamMatch(matchIdentifier, teamIdForMatchQuery);

  // 로딩 중
  if (isAuthLoading || isTeamLoading || isMembershipLoading || isMatchLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  // 팀을 찾을 수 없음
  if (!team) {
    notFound();
  }

  // 권한 체크: 팀원만 접근 가능
  if (!membership) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
        <h2 className="text-xl font-bold text-slate-900 mb-2">접근 권한이 없습니다</h2>
        <p className="text-sm text-slate-500 text-center">
          팀 운동 상세는 팀원만 볼 수 있습니다.
        </p>
      </div>
    );
  }

  // 매치를 찾을 수 없음 (다른 팀 매치 포함)
  if (!match || match.teamId !== team.id) {
    notFound();
  }

  return (
    <TeamMatchDetailView
      match={match}
      team={team}
      membership={membership}
      userId={user?.id}
      canQuickAddGuest={true}
    />
  );
}
