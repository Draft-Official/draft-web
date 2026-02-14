'use client';

import { use } from 'react';
import { notFound, redirect } from 'next/navigation';
import { useTeamByCode } from '@/features/team/api/core/queries';
import { useMyMembership } from '@/features/team/api/membership/queries';
import { useAuth } from '@/shared/session';
import { TeamMatchCreateForm } from '@/features/team/ui/components/match/team-match-create-form';

interface TeamMatchCreatePageProps {
  params: Promise<{ code: string }>;
}

export default function TeamMatchCreatePage({ params }: TeamMatchCreatePageProps) {
  const { code } = use(params);
  const { user, isLoading: isAuthLoading } = useAuth();

  // 팀 정보 조회
  const { data: team, isLoading: isTeamLoading } = useTeamByCode(code);

  // 멤버십 조회
  const { data: membership, isLoading: isMembershipLoading } = useMyMembership(
    team?.id,
    user?.id
  );

  // 로딩 중
  if (isAuthLoading || isTeamLoading || isMembershipLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // 로그인 필요
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
        <h2 className="text-xl font-bold text-slate-900 mb-2">로그인이 필요합니다</h2>
        <p className="text-sm text-slate-500 text-center">
          팀 운동을 개설하려면 로그인해주세요.
        </p>
      </div>
    );
  }

  // 팀을 찾을 수 없음
  if (!team) {
    notFound();
  }

  // 권한 체크: Leader 또는 Manager만 접근 가능
  if (!membership || !['LEADER', 'MANAGER'].includes(membership.role)) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
        <h2 className="text-xl font-bold text-slate-900 mb-2">접근 권한이 없습니다</h2>
        <p className="text-sm text-slate-500 text-center">
          팀 운동 개설은 팀장 또는 매니저만 가능합니다.
        </p>
      </div>
    );
  }

  return <TeamMatchCreateForm team={team} />;
}
