'use client';

import { getPositionLabel } from '@/shared/config/match-constants';
import { useTeamVotes } from '@/features/team/api/match/queries';
import type { TeamVoteDTO } from '@/features/team/model/types';
import {
  buildVoteStatusDialogGroups,
  VoteStatusDialog as BaseVoteStatusDialog,
} from '@/shared/ui/composite/vote-status-dialog';

interface TeamVoteStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
}

function toVoteDisplayNames(vote: TeamVoteDTO): string[] {
  const ownerName = vote.userNickname || '알 수 없음';
  const guestNames = vote.guestParticipants.map((guest) =>
    `${guest.name || '게스트'} (${getPositionLabel(guest.position, 'combined')})`
  );
  return [ownerName, ...guestNames];
}

export function TeamVoteStatusDialog({
  open,
  onOpenChange,
  matchId,
}: TeamVoteStatusDialogProps) {
  const { data: votes = [], isLoading } = useTeamVotes(open ? matchId : null);
  const groups = buildVoteStatusDialogGroups(votes, toVoteDisplayNames);

  return <BaseVoteStatusDialog open={open} onOpenChange={onOpenChange} isLoading={isLoading} groups={groups} />;
}
