'use client';

import { Users } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';
import { ScrollArea, ScrollBar } from '@/shared/ui/shadcn/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/shadcn/alert';
import { useAuth } from '@/shared/session';
import { useMyTeams } from '../api/team-info/queries';
import { useMyPendingVoteMatches } from '../api/match/queries';
import { useVote } from '../api/match/mutations';
import { TeamProfileCard } from './components/team-profile-card';
import { TeamMatchItem } from './components/team-match-item';
import type { TeamVoteStatusValue } from '@/shared/config/team-constants';
import { Spinner } from '@/shared/ui/shadcn/spinner';

/**
 * 나의 팀 탭
 * - 소속 팀 카드 (가로 스크롤)
 * - 팀 정기운동 목록
 * - 팀 없음 Empty State
 */
export function MyTeamsTab() {
  const { user } = useAuth();
  const { data: teams, isLoading } = useMyTeams(user?.id);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="w-6 h-6  text-muted-foreground" />
      </div>
    );
  }

  // 팀이 없는 경우 Empty State
  if (!teams || teams.length === 0) {
    return (
      <div className="p-(--dimension-spacing-x-global-gutter)">
        <Alert className="bg-white border-slate-200">
          <Users className="h-5 w-5 text-muted-foreground" />
          <AlertTitle className="font-bold text-slate-900">
            소속 팀이 없습니다
          </AlertTitle>
          <AlertDescription className="text-slate-500 mt-1">
            팀을 만들어 정기운동을 관리하고 팀원들과 함께 농구를 즐겨보세요.
            <br />
            <Button
              variant="link"
              className="p-0 h-auto text-muted-foreground font-bold"
              onClick={() => {
                // 팀 생성하기+ 탭으로 이동 (탭 전환)
                const trigger = document.querySelector(
                  '[data-state="inactive"][value="create-team"]'
                ) as HTMLButtonElement;
                trigger?.click();
              }}
            >
              팀 생성하기+ 탭에서 시작하기 →
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="pb-(--dimension-spacing-y-screen-bottom)">
      {/* 나의 팀 카드 섹션 */}
      <section className="pb-(--dimension-spacing-y-component-default)">
        <ScrollArea className="w-full">
          <div className="flex gap-(--dimension-spacing-y-component-default) px-(--dimension-spacing-x-global-gutter) py-1">
            {teams.map((team) => (
              <TeamProfileCard
                key={team.id}
                id={team.id}
                code={team.code}
                name={team.name}
                logoUrl={team.logoUrl}
                role={team.role}
                regularDay={team.regularDay}
                regularTime={team.regularTime}
                homeGymName={team.homeGymName}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* 팀 정기운동 섹션 */}
      <section className="px-(--dimension-spacing-x-global-gutter)">
        <h2 className="font-bold text-slate-900 text-lg mb-(--dimension-spacing-y-component-default)">팀 정기운동</h2>
        <PendingVoteMatches teamIds={teams.map((t) => t.id)} userId={user!.id} />
      </section>
    </div>
  );
}

/**
 * 팀 정기운동 목록 컴포넌트
 */
function PendingVoteMatches({ teamIds, userId }: { teamIds: string[]; userId: string }) {
  const { data: matches, isLoading } = useMyPendingVoteMatches(teamIds, userId);
  const voteMutation = useVote();

  const handleVote = (matchId: string, vote: TeamVoteStatusValue, reason: string) => {
    voteMutation.mutate({
      userId,
      input: {
        matchId,
        status: vote,
        description: reason,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="w-5 h-5  text-muted-foreground" />
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-(--dimension-spacing-y-component-default) text-center">
        예정된 팀 운동이 없습니다
      </p>
    );
  }

  return (
    <div className="space-y-(--dimension-spacing-y-component-default)">
      {matches.map((item) => {
        return (
          <TeamMatchItem
            key={item.matchId}
            publicId={item.publicId}
            teamCode={item.teamCode}
            teamName={item.teamName}
            teamLogoUrl={item.teamLogoUrl}
            date={item.dateDisplay}
            time={item.timeDisplay}
            gymName={item.gymName}
            gymAddress={item.gymAddress || undefined}
            status={item.status}
            myVote={item.myVote}
            myVoteReason={item.myVoteReason || undefined}
            votingSummary={item.votingSummary}
            onVote={(vote, reason) => handleVote(item.matchId, vote, reason)}
            isVoting={voteMutation.isPending}
          />
        );
      })}
    </div>
  );
}
