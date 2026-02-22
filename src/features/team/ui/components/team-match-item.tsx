'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '@/shared/ui/shadcn/button';
import { MatchCardLayout } from '@/shared/ui/composite/match-card-layout';
import { cn } from '@/shared/lib/utils';
import {
  MATCH_STATUS_LABELS,
  MATCH_STATUS_STYLES,
  type MatchStatusValue,
} from '@/shared/config/match-constants';
import {
  TEAM_VOTE_STATUS_LABELS,
  TEAM_VOTE_STATUS_STYLES,
  type TeamVoteStatusValue,
} from '@/shared/config/team-constants';
import { VoteDialog } from '@/shared/ui/composite/vote-dialog';

interface TeamMatchItemProps {
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
  className?: string;
}

/**
 * 팀 매치 아이템 컴포넌트
 * - 미투표 경기 목록에서 사용
 * - 투표 현황 표시
 */
export function TeamMatchItem({
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
  className,
}: TeamMatchItemProps) {
  const router = useRouter();
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);

  const handleClick = () => {
    router.push(`/team/${teamCode}/matches/${publicId}`);
  };

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVoteDialogOpen(true);
  };

  const handleVoteSubmit = (vote: TeamVoteStatusValue, reason: string) => {
    onVote?.(vote, reason);
    setIsVoteDialogOpen(false);
  };

  const statusLabel = MATCH_STATUS_LABELS[status];
  const statusStyle = MATCH_STATUS_STYLES[status];
  const hasVoted = myVote && myVote !== 'PENDING';

  return (
    <>
      <MatchCardLayout
        date={date}
        time={time}
        gymName={gymName}
        gymAddress={gymAddress}
        teamName={teamName}
        onClick={handleClick}
        className={className}
        topSlot={
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-medium border px-2.5 py-1',
                statusStyle.color,
                statusStyle.bgColor
              )}
            >
              {statusLabel}
            </Badge>
            {!hasVoted && (
              <Badge
                variant="outline"
                className="text-xs font-medium border px-2.5 py-1 bg-yellow-50 text-yellow-600 border-yellow-200"
              >
                미투표
              </Badge>
            )}
          </div>
        }
        bottomSlot={
          <div className="flex items-center justify-between">
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

            <Button
              size="sm"
              variant="outline"
              className={cn(
                'h-8 px-3 text-xs font-bold',
                hasVoted && TEAM_VOTE_STATUS_STYLES[myVote!].color,
                hasVoted && TEAM_VOTE_STATUS_STYLES[myVote!].borderColor
              )}
              onClick={handleVoteClick}
            >
              {hasVoted ? TEAM_VOTE_STATUS_LABELS[myVote!] : '투표하기'}
            </Button>
          </div>
        }
      />

      <VoteDialog
        open={isVoteDialogOpen}
        onOpenChange={setIsVoteDialogOpen}
        currentVote={myVote}
        currentReason={myVoteReason}
        onSubmit={handleVoteSubmit}
        isSubmitting={isVoting}
      />
    </>
  );
}
