'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { useTeamByCode } from '@/features/team/api/team-info/queries';
import { useMyMembership } from '@/features/team/api/membership/queries';
import { useTeamMatch } from '@/features/team/api/match/queries';
import { useAuth } from '@/shared/session';
import { TeamMatchDetailView } from '@/features/team/ui/components/match/team-match-detail-view';

interface TeamMatchDetailPageProps {
  params: Promise<{ code: string; matchId: string }>;
}

export default function TeamMatchDetailPage({ params }: TeamMatchDetailPageProps) {
  const { code, matchId } = use(params);
  const { user, isLoading: isAuthLoading } = useAuth();

  // 팀 정보 조회
  const { data: team, isLoading: isTeamLoading } = useTeamByCode(code);

  // 멤버십 조회
  const { data: membership, isLoading: isMembershipLoading } = useMyMembership(
    team?.id,
    user?.id
  );

  // 매치 상세 조회
  const { data: match, isLoading: isMatchLoading } = useTeamMatch(matchId);

  // 로딩 중
  if (isAuthLoading || isTeamLoading || isMembershipLoading || isMatchLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // 팀을 찾을 수 없음
  if (!team) {
    notFound();
  }

  // 매치를 찾을 수 없음
  if (!match) {
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

  return (
    <TeamMatchDetailView
      match={match}
      team={team}
      membership={membership}
      userId={user?.id}
    />
  );
}
