'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, MapPin, Clock, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { useSafeBack } from '@/shared/lib/hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import { VoteDialog } from '../vote-dialog';
import { VotingAccordion } from './voting-accordion';
import { FacilitySection } from './facility-section';
import { useTeamVotes, useVotingSummary, useMyVote } from '@/features/team/api/match/queries';
import { useVote, useCloseVoting, useReopenVoting } from '@/features/team/api/match/mutations';
import type { Match, Application } from '@/shared/types/database.types';
import type { ClientTeam, ClientTeamMember } from '@/features/team/model/types';
import type { TeamVoteStatusValue } from '@/shared/config/team-constants';

interface TeamMatchDetailViewProps {
  match: Match;
  team: ClientTeam;
  membership: ClientTeamMember;
  userId?: string;
}

export function TeamMatchDetailView({
  match,
  team,
  membership,
  userId,
}: TeamMatchDetailViewProps) {
  const router = useRouter();
  const handleBack = useSafeBack(`/team/${team.code}`);
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);

  // 투표 현황 조회
  const { data: votes = [], isLoading: isVotesLoading } = useTeamVotes(match.id);
  const { data: votingSummary } = useVotingSummary(match.id, team.id);
  const { data: myVote } = useMyVote(match.id, userId);

  // Mutations
  const { mutate: vote, isPending: isVoting } = useVote();
  const { mutate: closeVoting, isPending: isClosing } = useCloseVoting();
  const { mutate: reopenVoting, isPending: isReopening } = useReopenVoting();

  // 권한 체크
  const isLeader = membership.role === 'LEADER';
  const isManager = membership.role === 'MANAGER';
  const canManage = isLeader || isManager;
  const isVotingClosed = match.status === 'CLOSED';

  // 투표하기
  const handleVote = (status: TeamVoteStatusValue, reason: string) => {
    if (!userId) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    vote(
      {
        userId,
        input: {
          matchId: match.id,
          status,
          description: reason || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('투표가 완료되었습니다.');
          setIsVoteDialogOpen(false);
        },
        onError: (error) => {
          toast.error(`투표 실패: ${error.message}`);
        },
      }
    );
  };

  // 투표 마감
  const handleCloseVoting = () => {
    closeVoting(
      { matchId: match.id, teamId: team.id },
      {
        onSuccess: () => toast.success('투표가 마감되었습니다.'),
        onError: (error) => toast.error(`마감 실패: ${error.message}`),
      }
    );
  };

  // 투표 재오픈
  const handleReopenVoting = () => {
    reopenVoting(
      { matchId: match.id, teamId: team.id },
      {
        onSuccess: () => toast.success('투표가 재오픈되었습니다.'),
        onError: (error) => toast.error(`재오픈 실패: ${error.message}`),
      }
    );
  };

  // 날짜/시간 포맷팅
  const formatDateTime = () => {
    const startDate = new Date(match.start_time);
    const endDate = new Date(match.end_time);
    const month = startDate.getMonth() + 1;
    const date = startDate.getDate();
    const day = ['일', '월', '화', '수', '목', '금', '토'][startDate.getDay()];
    const startTime = startDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const endTime = endDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${month}월 ${date}일 (${day}) ${startTime} ~ ${endTime}`;
  };

  // 체육관 정보
  const gym = (match as unknown as { gyms?: { name: string; address: string } }).gyms;

  // 내 투표 상태
  const myVoteStatus = myVote?.status as TeamVoteStatusValue | undefined;
  const hasVoted = myVoteStatus && myVoteStatus !== 'PENDING';

  return (
    <div className="min-h-screen bg-slate-100 relative pb-[100px]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 h-14 flex items-center justify-between px-2">
        <button
          onClick={handleBack}
          className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h1 className="font-bold text-lg text-slate-900 absolute left-1/2 -translate-x-1/2">
          팀 운동
        </h1>

        {/* Admin Menu */}
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {!isVotingClosed ? (
                <DropdownMenuItem
                  onClick={handleCloseVoting}
                  disabled={isClosing}
                  className="text-slate-700"
                >
                  투표 마감
                </DropdownMenuItem>
              ) : (
                isLeader && (
                  <DropdownMenuItem
                    onClick={handleReopenVoting}
                    disabled={isReopening}
                    className="text-slate-700"
                  >
                    투표 재오픈
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {!canManage && <div className="w-10" />}
      </header>

      {/* Content */}
      <main className="px-3 pt-3 space-y-2">
        {/* 제목 + 시간/위치 섹션 */}
        <section className="bg-white rounded-xl border border-slate-200 px-5 py-6">
          <h1 className="text-xl font-bold text-slate-900 mb-4">
            {team.name} 정기운동
          </h1>

          <div className="space-y-3">
            {/* 날짜/시간 */}
            <div className="flex items-center gap-3 text-slate-600">
              <Clock className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-sm">{formatDateTime()}</span>
            </div>

            {/* 장소 */}
            {gym && (
              <div className="flex items-start gap-3 text-slate-600">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{gym.name}</p>
                  <p className="text-xs text-slate-500">{gym.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* 투표 마감 배지 */}
          {isVotingClosed && (
            <div className="mt-4 px-3 py-2 bg-slate-100 rounded-lg">
              <p className="text-sm font-medium text-slate-600">투표가 마감되었습니다</p>
            </div>
          )}
        </section>

        {/* 투표 현황 섹션 */}
        <section className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              투표 현황
              {votingSummary && (
                <span className="text-sm font-normal text-slate-500">
                  ({votingSummary.attending + votingSummary.late}명 참석 / {votingSummary.totalMembers}명)
                </span>
              )}
            </h2>
          </div>

          {isVotesLoading ? (
            <div className="px-5 py-8 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : (
            <VotingAccordion
              votes={votes}
              votingSummary={votingSummary}
              isAdmin={canManage}
              matchId={match.id}
              isVotingClosed={isVotingClosed}
            />
          )}
        </section>

        {/* 시설 정보 섹션 */}
        {gym && (
          <FacilitySection match={match} gym={gym} />
        )}
      </main>

      {/* Bottom Bar - 투표 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none md:pl-[240px]">
        <div className="max-w-[760px] mx-auto bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => setIsVoteDialogOpen(true)}
            disabled={isVotingClosed}
            className={cn(
              'w-full h-12 rounded-xl font-bold text-lg transition-all',
              isVotingClosed
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-[#FF6600] text-white hover:bg-[#FF6600]/90'
            )}
          >
            {isVotingClosed
              ? '투표 마감됨'
              : hasVoted
              ? '투표 변경하기'
              : '투표하기'}
          </button>
        </div>
      </div>

      {/* Vote Dialog */}
      <VoteDialog
        open={isVoteDialogOpen}
        onOpenChange={setIsVoteDialogOpen}
        currentVote={myVoteStatus}
        currentReason={myVote?.description || ''}
        onSubmit={handleVote}
        isSubmitting={isVoting}
      />
    </div>
  );
}
