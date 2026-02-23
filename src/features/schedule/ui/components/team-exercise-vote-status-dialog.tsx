'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { useTeamExerciseVotes } from '../../api/queries';
import type { TeamExerciseVoteItemDTO } from '../../model/types';

interface TeamExerciseVoteStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
}

interface VoteGroup {
  key: 'attending' | 'notAttending' | 'maybe' | 'pending';
  label: string;
  names: string[];
}

function buildVoteGroups(votes: TeamExerciseVoteItemDTO[]): VoteGroup[] {
  const attending = votes
    .filter((vote) => vote.status === 'CONFIRMED' || vote.status === 'LATE')
    .map((vote) => vote.name);
  const notAttending = votes
    .filter((vote) => vote.status === 'NOT_ATTENDING')
    .map((vote) => vote.name);
  const maybe = votes
    .filter((vote) => vote.status === 'MAYBE')
    .map((vote) => vote.name);
  const pending = votes
    .filter((vote) => vote.status === 'PENDING')
    .map((vote) => vote.name);

  return [
    {
      key: 'attending',
      label: '참석',
      names: attending,
    },
    {
      key: 'notAttending',
      label: '불참',
      names: notAttending,
    },
    {
      key: 'maybe',
      label: '미정',
      names: maybe,
    },
    {
      key: 'pending',
      label: '미투표',
      names: pending,
    },
  ];
}

export function TeamExerciseVoteStatusDialog({
  open,
  onOpenChange,
  matchId,
}: TeamExerciseVoteStatusDialogProps) {
  const { data: votes = [], isLoading } = useTeamExerciseVotes(matchId, open);
  const groups = buildVoteGroups(votes);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>투표현황</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-10 flex justify-center">
            <Spinner className="h-6 w-6 text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <section key={group.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">{group.label}</h3>
                  <span className="text-sm font-medium text-slate-500">{group.names.length}명</span>
                </div>

                {group.names.length === 0 ? (
                  <p className="text-sm text-slate-400 py-1">해당 팀원이 없습니다</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {group.names.map((name, index) => (
                      <span
                        key={`${group.key}-${name}-${index}`}
                        className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-800"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
