'use client';

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
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { useTeamVotes } from '@/features/team/api/match/queries';
import type { TeamVoteDTO } from '@/features/team/model/types';

interface TeamVoteStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
}

interface VoteGroup {
  key: 'attending' | 'notAttending' | 'maybe' | 'pending';
  label: string;
  names: string[];
}

function buildVoteGroups(votes: TeamVoteDTO[]): VoteGroup[] {
  const attending = votes
    .filter((vote) => vote.status === 'CONFIRMED' || vote.status === 'LATE')
    .map((vote) => vote.userNickname || '알 수 없음');
  const notAttending = votes
    .filter((vote) => vote.status === 'NOT_ATTENDING')
    .map((vote) => vote.userNickname || '알 수 없음');
  const maybe = votes
    .filter((vote) => vote.status === 'MAYBE')
    .map((vote) => vote.userNickname || '알 수 없음');
  const pending = votes
    .filter((vote) => vote.status === 'PENDING')
    .map((vote) => vote.userNickname || '알 수 없음');

  return [
    { key: 'attending', label: '참석', names: attending },
    { key: 'notAttending', label: '불참', names: notAttending },
    { key: 'maybe', label: '미정', names: maybe },
    { key: 'pending', label: '미투표', names: pending },
  ];
}

export function TeamVoteStatusDialog({
  open,
  onOpenChange,
  matchId,
}: TeamVoteStatusDialogProps) {
  const { data: votes = [], isLoading } = useTeamVotes(open ? matchId : null);
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

