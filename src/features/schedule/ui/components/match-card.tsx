'use client';

import { Trophy } from 'lucide-react';
import { Badge } from '@/shared/ui/shadcn/badge';
import { MatchCardLayout } from '@/shared/ui/composite/match-card-layout';
import { cn } from '@/shared/lib/utils';
import type { ScheduleMatchListItemDTO } from '../../model/types';
import type { UnreadMatchNotificationDTO } from '@/features/notification';
import type { TeamVoteStatusValue } from '@/shared/config/application-constants';
import {
  MANAGEMENT_TYPE_COLORS,
  MANAGEMENT_TYPE_LABELS,
  MATCH_STATUS_COLORS,
  MATCH_STATUS_LABELS,
  PAST_MATCH_STATUSES,
} from '../../config/constants';
import { GuestRecruitmentCard } from './guest-recruitment-card';
import { TeamExerciseCard } from './team-exercise-card';

interface MatchCardProps {
  match: ScheduleMatchListItemDTO;
  notifications?: UnreadMatchNotificationDTO[];
  onClick: (matchId: string) => void;
  onConfirmPayment?: (applicationId: string, matchId: string) => void;
  onVote?: (matchId: string, vote: TeamVoteStatusValue, reason: string) => void;
  isVoting?: boolean;
}

function TournamentCard({
  match,
  onClick,
}: Pick<MatchCardProps, 'match' | 'onClick'>) {
  const isPastMatch = PAST_MATCH_STATUSES.includes(match.status);

  return (
    <MatchCardLayout
      date={match.date}
      time={match.time}
      gymName={match.location}
      gymAddress={match.locationUrl}
      teamName={match.teamName}
      onClick={() => onClick(match.id)}
      onLocationClick={() => {
        if (match.locationUrl) window.open(match.locationUrl, '_blank');
      }}
      isPast={isPastMatch}
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
              MATCH_STATUS_COLORS[match.status]
            )}
          >
            {MATCH_STATUS_LABELS[match.status]}
          </Badge>
        </>
      }
      bottomSlot={
        <div className="flex items-center gap-1 text-slate-600">
          <Trophy className="w-4 h-4 text-slate-400" />
          <span className="font-medium">{match.tournamentName}</span>
          <span className="text-slate-300">|</span>
          <span>{match.round}</span>
        </div>
      }
    />
  );
}

export function MatchCard({
  match,
  notifications,
  onClick,
  onConfirmPayment,
  onVote,
  isVoting = false,
}: MatchCardProps) {
  if (match.managementType === 'guest_recruitment') {
    return (
      <GuestRecruitmentCard
        match={match}
        notifications={notifications}
        onClick={onClick}
        onConfirmPayment={onConfirmPayment}
      />
    );
  }

  if (match.managementType === 'team_exercise') {
    return (
      <TeamExerciseCard
        match={match}
        notifications={notifications}
        onClick={onClick}
        onVote={onVote}
        isVoting={isVoting}
      />
    );
  }

  return <TournamentCard match={match} onClick={onClick} />;
}
