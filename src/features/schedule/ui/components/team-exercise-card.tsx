'use client';

import { useRef, useState } from 'react';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '@/shared/ui/shadcn/button';
import { MatchCardLayout } from '@/shared/ui/composite/match-card-layout';
import { VoteDialog } from '@/shared/ui/composite/vote-dialog';
import { cn } from '@/shared/lib/utils';
import type { ScheduleMatchListItemDTO } from '../../model/types';
import type { UnreadMatchNotificationDTO } from '@/features/notification';
import { NOTIFICATION_TYPE_DESCRIPTIONS } from '@/shared/config/match-constants';
import {
  TEAM_VOTE_STATUS_LABELS,
  type TeamVoteStatusValue,
} from '@/shared/config/application-constants';
import {
  MANAGEMENT_TYPE_COLORS,
  MANAGEMENT_TYPE_LABELS,
  MATCH_STATUS_COLORS,
  MATCH_STATUS_LABELS,
  PAST_MATCH_STATUSES,
  TEAM_EXERCISE_VOTE_BADGE_COLORS,
} from '../../config/constants';
import { TeamExerciseVoteStatusDialog } from './team-exercise-vote-status-dialog';

interface TeamExerciseCardProps {
  match: ScheduleMatchListItemDTO;
  notifications?: UnreadMatchNotificationDTO[];
  onClick: (matchId: string) => void;
  onVote?: (matchId: string, vote: TeamVoteStatusValue, reason: string) => void;
  isVoting?: boolean;
  isActive?: boolean;
}

export function TeamExerciseCard({
  match,
  notifications,
  onClick,
  onVote,
  isVoting = false,
  isActive = false,
}: TeamExerciseCardProps) {
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
  const [isVoteStatusOpen, setIsVoteStatusOpen] = useState(false);
  const dialogClosedAt = useRef(0);
  const isManagingMode = match.scheduleMode === 'managing';
  const isPastMatch = PAST_MATCH_STATUSES.includes(match.status);
  const hasVoted = match.myVote && match.myVote !== 'PENDING';
  const isVoteClosed = match.status === 'closed';

  const handleVoteDialogChange = (open: boolean) => {
    if (!open) dialogClosedAt.current = Date.now();
    setIsVoteDialogOpen(open);
  };

  const handleLocationClick = () => {
    if (match.locationUrl) {
      window.open(match.locationUrl, '_blank');
    }
  };

  const handleVoteSubmit = (vote: TeamVoteStatusValue, reason: string) => {
    onVote?.(match.id, vote, reason);
    setIsVoteDialogOpen(false);
  };

  const renderStatusBadge = () => {
    if (isPastMatch) {
      return {
        label: MATCH_STATUS_LABELS[match.status],
        className: MATCH_STATUS_COLORS[match.status],
      };
    }

    if (isVoteClosed) {
      return {
        label: '투표마감',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
      };
    }

    const voteStatus = (match.myVote ?? 'PENDING') as TeamVoteStatusValue;

    return {
      label: TEAM_VOTE_STATUS_LABELS[voteStatus],
      className: TEAM_EXERCISE_VOTE_BADGE_COLORS[voteStatus],
    };
  };

  const statusBadge = renderStatusBadge();

  return (
    <>
      <MatchCardLayout
        date={match.date}
        time={match.time}
        gymName={match.location}
        gymAddress={match.locationUrl}
        teamName={match.teamName}
        onClick={() => {
          if (Date.now() - dialogClosedAt.current < 300) return;
          onClick(match.id);
        }}
        onLocationClick={handleLocationClick}
        isPast={isPastMatch}
        className={cn(
          isActive && 'ring-2 ring-primary/25 border-primary/40 shadow-md'
        )}
        headerSlot={
          !isPastMatch && notifications && notifications.length > 0 ? (
            <div className="bg-brand-weak px-4 py-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-primary rounded leading-none shrink-0">
                new
              </span>
              <span className="text-xs font-medium text-slate-600 truncate">
                {NOTIFICATION_TYPE_DESCRIPTIONS[notifications[0].type]}
              </span>
              {notifications.length > 1 && (
                <span className="text-xs text-slate-400 shrink-0">외 {notifications.length - 1}건</span>
              )}
            </div>
          ) : undefined
        }
        topSlot={
          <>
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-medium border px-2.5 py-1',
                MANAGEMENT_TYPE_COLORS[match.managementType]
              )}
            >
              {MANAGEMENT_TYPE_LABELS[match.managementType]}
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
                <strong className="text-green-600">{match.votingSummary?.attending ?? 0}명</strong>
              </span>
              <span>
                불참{' '}
                <strong className="text-red-500">{match.votingSummary?.notAttending ?? 0}명</strong>
              </span>
              <span>
                미투표{' '}
                <strong className="text-slate-600">{match.votingSummary?.pending ?? 0}명</strong>
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

              {!isManagingMode && (
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
              )}
            </div>
          </div>
        }
      />

      {!isManagingMode && (
        <VoteDialog
          open={isVoteDialogOpen}
          onOpenChange={handleVoteDialogChange}
          currentVote={match.myVote}
          currentReason={match.myVoteReason}
          onSubmit={handleVoteSubmit}
          isSubmitting={isVoting}
        />
      )}

      <TeamExerciseVoteStatusDialog
        open={isVoteStatusOpen}
        onOpenChange={setIsVoteStatusOpen}
        matchId={match.id}
      />
    </>
  );
}
