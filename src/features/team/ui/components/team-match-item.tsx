'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '@/shared/ui/shadcn/button';
import { MatchCardLayout } from '@/shared/ui/composite/match-card-layout';
import { cn } from '@/shared/lib/utils';
import { DESKTOP_SPLIT_ACTIVE_CARD_CLASS } from '@/shared/ui/layout';
import {
  type MatchStatusValue,
} from '@/shared/config/match-constants';
import {
  TEAM_VOTE_STATUS_LABELS,
  type TeamVoteStatusValue,
} from '@/shared/config/team-constants';
import { VoteDialog } from '@/shared/ui/composite/vote-dialog';
import { TeamVoteStatusDialog } from './match/team-vote-status-dialog';

interface TeamMatchItemProps {
  matchId: string;
  publicId: string;
  teamCode: string;
  teamName: string;
  teamLogoUrl?: string | null;
  date: string; // "2026. 02. 08 (일)"
  time: string; // "19:00"
  gymName: string;
  gymAddress?: string;
  status: MatchStatusValue;
  myVote?: TeamVoteStatusValue;
  myVoteReason?: string;
  votingSummary: {
    attending: number;
    notAttending: number;
    pending: number;
  };
  onVote?: (vote: TeamVoteStatusValue, reason: string) => void;
  isVoting?: boolean;
  onMatchSelect?: (detailPath: string) => void;
  isActive?: boolean;
  className?: string;
}

/**
 * 팀 매치 아이템 컴포넌트
 * - 미투표 경기 목록에서 사용
 * - 투표 현황 표시
 */
export function TeamMatchItem({
  matchId,
  publicId,
  teamCode,
  teamName,
  date,
  time,
  gymName,
  gymAddress,
  status,
  myVote,
  myVoteReason,
  votingSummary,
  onVote,
  isVoting = false,
  onMatchSelect,
  isActive = false,
  className,
}: TeamMatchItemProps) {
  const router = useRouter();
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
  const [isVoteStatusOpen, setIsVoteStatusOpen] = useState(false);
  const dialogClosedAt = useRef(0);

  const handleClick = () => {
    if (Date.now() - dialogClosedAt.current < 300) return;
    const detailPath = `/team/${teamCode}/matches/${publicId}`;

    if (onMatchSelect) {
      onMatchSelect(detailPath);
      return;
    }

    router.push(detailPath);
  };

  const handleVoteDialogChange = (open: boolean) => {
    if (!open) dialogClosedAt.current = Date.now();
    setIsVoteDialogOpen(open);
  };

  const handleVoteStatusChange = (open: boolean) => {
    if (!open) dialogClosedAt.current = Date.now();
    setIsVoteStatusOpen(open);
  };

  const handleVoteSubmit = (vote: TeamVoteStatusValue, reason: string) => {
    onVote?.(vote, reason);
    setIsVoteDialogOpen(false);
  };

  const isPastMatch = status === 'FINISHED' || status === 'CANCELED';
  const isVoteClosed = status === 'CLOSED';
  const currentVote = (myVote ?? 'PENDING') as TeamVoteStatusValue;
  const hasVoted = myVote && myVote !== 'PENDING';

  const voteBadgeColors: Record<TeamVoteStatusValue, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    CONFIRMED: 'bg-green-500/10 text-green-700 border-green-500/20',
    LATE: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    NOT_ATTENDING: 'bg-red-500/10 text-red-700 border-red-500/20',
    MAYBE: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
  };

  const statusBadge = (() => {
    if (isPastMatch) {
      return {
        label: status === 'CANCELED' ? '취소' : '종료',
        className: 'bg-gray-100 text-gray-500 border-gray-200',
      };
    }

    if (isVoteClosed) {
      return {
        label: '투표마감',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
      };
    }

    return {
      label: TEAM_VOTE_STATUS_LABELS[currentVote],
      className: voteBadgeColors[currentVote],
    };
  })();

  return (
    <>
      <MatchCardLayout
        date={date}
        time={time}
        gymName={gymName}
        gymAddress={gymAddress}
        teamName={teamName}
        onClick={handleClick}
        className={cn(
          className,
          isActive && DESKTOP_SPLIT_ACTIVE_CARD_CLASS
        )}
        topSlot={
          <>
            <Badge
              variant="outline"
              className="text-xs font-medium border px-2.5 py-1 bg-green-500/10 text-green-700 border-green-500/20"
            >
              팀운동
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-medium border px-2.5 py-1',
                statusBadge.className
              )}
            >
              {statusBadge.label}
            </Badge>
          </>
        }
        bottomSlot={
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-4 text-sm">
              <span>
                참석{' '}
                <strong className="text-green-600">{votingSummary.attending}명</strong>
              </span>
              <span>
                불참{' '}
                <strong className="text-red-500">{votingSummary.notAttending}명</strong>
              </span>
              <span>
                미투표{' '}
                <strong className="text-slate-600">{votingSummary.pending}명</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVoteStatusOpen(true);
                }}
              >
                투표현황
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={isVoteClosed}
                className={cn(
                  'h-8 px-3 text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-50',
                  isVoteClosed && 'bg-slate-100 text-slate-500 hover:bg-slate-100'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isVoteClosed) return;
                  setIsVoteDialogOpen(true);
                }}
              >
                {isVoteClosed ? '투표마감' : hasVoted ? '투표변경' : '투표하기'}
              </Button>
            </div>
          </div>
        }
      />

      <VoteDialog
        open={isVoteDialogOpen}
        onOpenChange={handleVoteDialogChange}
        currentVote={myVote}
        currentReason={myVoteReason}
        onSubmit={handleVoteSubmit}
        isSubmitting={isVoting}
      />

      <TeamVoteStatusDialog
        open={isVoteStatusOpen}
        onOpenChange={handleVoteStatusChange}
        matchId={matchId}
      />
    </>
  );
}
