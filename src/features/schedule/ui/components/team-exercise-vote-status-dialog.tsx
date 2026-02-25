'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/shadcn/accordion';
import { Button } from '@/shared/ui/shadcn/button';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { useTeamExerciseVotes } from '../../api/queries';
import { MOCK_TEAM_EXERCISE_VOTES_30 } from '../../model/mock-data';
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

function toVoteDisplayNames(vote: TeamExerciseVoteItemDTO): string[] {
  const guestNames = (vote.guestNames ?? []).map((name) => `${name} (게스트)`);
  return [vote.name, ...guestNames];
}

function buildVoteGroups(votes: TeamExerciseVoteItemDTO[]): VoteGroup[] {
  const attending = votes
    .filter((vote) => vote.status === 'CONFIRMED' || vote.status === 'LATE')
    .flatMap(toVoteDisplayNames);
  const notAttending = votes
    .filter((vote) => vote.status === 'NOT_ATTENDING')
    .flatMap(toVoteDisplayNames);
  const maybe = votes
    .filter((vote) => vote.status === 'MAYBE')
    .flatMap(toVoteDisplayNames);
  const pending = votes
    .filter((vote) => vote.status === 'PENDING')
    .flatMap(toVoteDisplayNames);

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
  const searchParams = useSearchParams();
  const [isVoteMockMode, setIsVoteMockMode] = useState(
    () => searchParams?.get('voteMock') === '1'
  );
  const { data: fetchedVotes = [], isLoading } = useTeamExerciseVotes(
    matchId,
    open && !isVoteMockMode
  );
  const votes = isVoteMockMode ? MOCK_TEAM_EXERCISE_VOTES_30 : fetchedVotes;
  const groups = buildVoteGroups(votes);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-0">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>투표현황</DialogTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => setIsVoteMockMode((prev) => !prev)}
            >
              {isVoteMockMode ? '실데이터 보기' : 'Mock 30명 보기'}
            </Button>
          </div>
        </DialogHeader>

        {!isVoteMockMode && isLoading ? (
          <div className="py-10 flex justify-center">
            <Spinner className="h-6 w-6 text-muted-foreground" />
          </div>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={['attending', 'notAttending']}
            className="w-full rounded-xl overflow-hidden"
          >
            {groups.map((group) => (
              <AccordionItem key={group.key} value={group.key} className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50">
                  <div className="flex w-full items-center justify-between pr-2">
                    <h3 className="text-base font-bold text-slate-900">{group.label}</h3>
                    <span className="text-sm font-medium text-slate-500">{group.names.length}명</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {group.names.length === 0 ? (
                    <p className="text-sm text-slate-400 py-1">해당 팀원이 없습니다</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {group.names.map((name, index) => (
                        <span
                          key={`${group.key}-${name}-${index}`}
                          className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </DialogContent>
    </Dialog>
  );
}
