'use client';

import { useTeamExerciseVotes } from '../../api/queries';
import type { TeamExerciseVoteItemDTO } from '../../model/types';
import {
  buildVoteStatusDialogGroups,
  VoteStatusDialog as BaseVoteStatusDialog,
} from '@/shared/ui/composite/vote-status-dialog';

interface TeamExerciseVoteStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
}

function toVoteDisplayNames(vote: TeamExerciseVoteItemDTO): string[] {
  const guestNames = (vote.guestNames ?? []).map((name) => `${name} (게스트)`);
  return [vote.name, ...guestNames];
}

export function TeamExerciseVoteStatusDialog({
  open,
  onOpenChange,
  matchId,
}: TeamExerciseVoteStatusDialogProps) {
  const { data: votes = [], isLoading } = useTeamExerciseVotes(matchId, open);
  const groups = buildVoteStatusDialogGroups(votes, toVoteDisplayNames);

  return (
    <BaseVoteStatusDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isLoading}
      groups={groups}
      headerClassName="space-y-0"
    />
  );
}
