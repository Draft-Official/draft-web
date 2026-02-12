'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/shadcn/tabs';
import { cn } from '@/shared/lib/utils';
import { useTeamByCode } from '../api/core/queries';
import { useTeamMembers, usePendingMembers, useMyMembership, useTeamMemberCount } from '../api/membership/queries';
import { useTeamMatches } from '../api/match/queries';
import { useAuth } from '@/features/auth/model/auth-context';
import { useSafeBack } from '@/shared/lib/hooks';
import {
  TeamDetailHeader,
  TeamHomeTab,
  TeamScheduleTab,
  TeamMembersTab,
  TeamFab,
} from './components/detail';

interface TeamDetailViewProps {
  code: string;
}

/**
 * 팀 상세 페이지 뷰
 * - 헤더 + 3탭 (홈/일정/멤버)
 */
export function TeamDetailView({ code }: TeamDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const handleBack = useSafeBack('/team');

  // URL에서 탭 상태 읽기 (home, schedule, members)
  const viewParam = searchParams.get('view');
  const currentView = viewParam === 'schedule' || viewParam === 'members' ? viewParam : 'home';

  // 팀 정보 조회
  const { data: team, isLoading: isLoadingTeam } = useTeamByCode(code);

  // 멤버십 조회
  const { data: membership, isLoading: isLoadingMembership } = useMyMembership(
    team?.id,
    user?.id
  );

  // 활성 멤버인지 확인 (ACCEPTED 상태만)
  const isMember = membership?.status === 'ACCEPTED';

  // 탭 변경 핸들러 (URL query param 업데이트)
  const handleTabChange = (newView: string) => {
    // 비멤버는 home 탭만 허용
    if (!isMember && newView !== 'home') {
      return;
    }

    const url = newView === 'home'
      ? `/team/${code}`
      : `/team/${code}?view=${newView}`;

    // replace를 사용하여 히스토리 오염 방지
    router.replace(url);
  };

  // 멤버 목록 조회 (멤버만)
  const { data: members = [], isLoading: isLoadingMembers } = useTeamMembers(
    isMember ? team?.id : undefined
  );

  // 대기 중인 가입 신청 수 (멤버만)
  const { data: pendingMembers = [] } = usePendingMembers(
    isMember ? team?.id : undefined
  );

  // 멤버 수
  const { data: memberCount = 0 } = useTeamMemberCount(team?.id);

  // 팀 매치 목록 (멤버만)
  const { data: matches = [], isLoading: isLoadingMatches } = useTeamMatches(
    isMember ? team?.id : undefined
  );

  // 로딩 중
  if (isLoadingTeam || isLoadingMembership) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // 팀을 찾을 수 없음
  if (!team) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center px-4">
          <button
            onClick={handleBack}
            className="p-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
          <h2 className="text-xl font-bold text-slate-900 mb-2">팀을 찾을 수 없습니다</h2>
          <p className="text-sm text-slate-500 text-center">
            팀 코드가 올바른지 확인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 (뒤로가기) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center justify-between px-4">
        <button
          onClick={handleBack}
          className="p-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">{team.name}</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* 팀 헤더 (로고, 이름, 버튼) */}
      <TeamDetailHeader
        team={team}
        membership={membership || null}
        homeGymName={team.homeGymName}
        isLoggedIn={!!user}
        currentView={currentView}
      />

      {/* 탭 네비게이션 */}
      <Tabs value={currentView} onValueChange={handleTabChange} className="flex-1">
        <TabsList
          variant="line"
          className="w-full justify-start px-5 bg-white border-b border-slate-100 sticky top-14 z-30"
        >
          <TabsTrigger
            value="home"
            className={cn(
              'flex-1 text-base font-medium py-3',
              'data-[state=active]:text-slate-900 data-[state=active]:font-bold',
              'data-[state=active]:after:bg-slate-900'
            )}
          >
            홈
          </TabsTrigger>
          {/* 일정/멤버 탭은 멤버만 표시 */}
          {isMember && (
            <>
              <TabsTrigger
                value="schedule"
                className={cn(
                  'flex-1 text-base font-medium py-3',
                  'data-[state=active]:text-slate-900 data-[state=active]:font-bold',
                  'data-[state=active]:after:bg-slate-900'
                )}
              >
                일정
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className={cn(
                  'flex-1 text-base font-medium py-3',
                  'data-[state=active]:text-slate-900 data-[state=active]:font-bold',
                  'data-[state=active]:after:bg-slate-900'
                )}
              >
                멤버
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* 탭 컨텐츠 */}
        <TabsContent value="home" className="mt-0">
          <TeamHomeTab
            team={team}
            homeGymName={team.homeGymName}
            memberCount={memberCount}
          />
        </TabsContent>

        {/* 일정/멤버 탭 컨텐츠는 멤버만 */}
        {isMember && (
          <>
            <TabsContent value="schedule" className="mt-0">
              <TeamScheduleTab
                teamCode={code}
                matches={matches}
                isLoading={isLoadingMatches}
              />
            </TabsContent>

            <TabsContent value="members" className="mt-0">
              <TeamMembersTab
                teamCode={code}
                members={members}
                pendingCount={pendingMembers.length}
                myRole={membership?.role || null}
                isLoading={isLoadingMembers}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* FAB - 활성 멤버만 표시 */}
      {isMember && <TeamFab teamCode={code} role={membership.role} />}
    </div>
  );
}
