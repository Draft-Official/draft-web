'use client';

import { useState } from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
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
import { TeamHeroSection } from './team-hero-section';
import { TeamVotingSection } from './team-voting-section';
import { TeamInfoSection } from './team-info-section';
import { TeamFacilitySection } from './team-facility-section';
import { useTeamVotes, useVotingSummary, useMyVote } from '@/features/team/api/match/queries';
import { useVote, useCloseVoting, useReopenVoting } from '@/features/team/api/match/mutations';
import type {
  TeamInfoDTO,
  TeamMatchDetailDTO,
  TeamMembershipDTO,
} from '@/features/team/model/types';
import type { TeamVoteStatusValue } from '@/shared/config/team-constants';

interface TeamMatchDetailViewProps {
  match: TeamMatchDetailDTO;
  team: TeamInfoDTO;
  membership: TeamMembershipDTO;
  userId?: string;
}

export function TeamMatchDetailView({
  match,
  team,
  membership,
  userId,
}: TeamMatchDetailViewProps) {
  const handleBack = useSafeBack(`/team/${team.code}`);
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);

  // 투표 현황 조회
  const { data: votes = [], isLoading: isVotesLoading } = useTeamVotes(match.matchId);
  const { data: votingSummary } = useVotingSummary(match.matchId, team.id);
  const { data: myVote } = useMyVote(match.matchId, userId);

  // Mutations
  const { mutate: vote, isPending: isVoting } = useVote();
  const { mutate: closeVoting, isPending: isClosing } = useCloseVoting();
  const { mutate: reopenVoting, isPending: isReopening } = useReopenVoting();

  // 권한 체크
  const isLeader = membership.role === 'LEADER';
  const isManager = membership.role === 'MANAGER';
  const canManage = isLeader || isManager;
  const isVotingClosed = match.isVotingClosed;

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
          matchId: match.matchId,
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
      { matchId: match.matchId, teamId: team.id },
      {
        onSuccess: () => toast.success('투표가 마감되었습니다.'),
        onError: (error) => toast.error(`마감 실패: ${error.message}`),
      }
    );
  };

  // 투표 재오픈
  const handleReopenVoting = () => {
    reopenVoting(
      { matchId: match.matchId, teamId: team.id },
      {
        onSuccess: () => toast.success('투표가 재오픈되었습니다.'),
        onError: (error) => toast.error(`재오픈 실패: ${error.message}`),
      }
    );
  };

  // 내 투표 상태
  const myVoteStatus = myVote?.status as TeamVoteStatusValue | undefined;
  const hasVoted = myVoteStatus && myVoteStatus !== 'PENDING';

  return (
    <div className="min-h-screen bg-background relative pb-[100px] app-content-container">

      {/* 1. Header (Sticky) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-[52px] flex items-center justify-between px-2">
        <button
          onClick={handleBack}
          className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-1">
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
        </div>
      </header>

      {/* 2. Content Sections */}
      <main>
        <TeamHeroSection match={match} teamName={team.name} />

        {/* 투표 마감 배지 */}
        {isVotingClosed && (
          <div className="px-5 pb-4">
            <div className="px-3 py-2 bg-slate-100 rounded-lg">
              <p className="text-sm font-medium text-slate-600">투표가 마감되었습니다</p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-slate-100 mx-5" />

        <TeamVotingSection
          votes={votes}
          votingSummary={votingSummary ?? undefined}
          isAdmin={canManage}
          matchId={match.matchId}
          isVotingClosed={isVotingClosed}
          isLoading={isVotesLoading}
        />

        <div className="h-px bg-slate-100 mx-5" />

        <TeamInfoSection team={team} />

        <div className="h-px bg-slate-100 mx-5" />

        <TeamFacilitySection match={match} id="facility-section" />
      </main>

      {/* Bottom Bar - 투표 버튼 */}
      <div className="app-overlay-shell app-overlay-shell--with-sidebar">
        <div className="app-overlay-content bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => setIsVoteDialogOpen(true)}
            disabled={isVotingClosed}
            className={cn(
              'w-full h-12 rounded-xl font-bold text-lg transition-all',
              isVotingClosed
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90'
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
