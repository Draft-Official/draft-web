'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { RadioGroup } from '@/shared/ui/shadcn/radio-group';
import { Button } from '@/shared/ui/base/button';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { useUpdateMemberVote } from '@/features/team/api/match/mutations';
import {
  TEAM_VOTE_OPTIONS,
  type TeamVoteStatusValue,
} from '@/shared/config/team-constants';

interface VoteChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  memberId: string;
  memberName: string;
  currentVote: TeamVoteStatusValue;
}

export function VoteChangeDialog({
  open,
  onOpenChange,
  matchId,
  memberId,
  memberName,
  currentVote,
}: VoteChangeDialogProps) {
  const [selectedVote, setSelectedVote] = useState<TeamVoteStatusValue | undefined>(
    currentVote && currentVote !== 'PENDING' ? currentVote : undefined
  );

  const { mutate: updateMemberVote, isPending } = useUpdateMemberVote();

  const handleSubmit = () => {
    if (!selectedVote) {
      toast.error('투표 상태를 선택해주세요.');
      return;
    }

    updateMemberVote(
      {
        matchId,
        memberId,
        status: selectedVote,
      },
      {
        onSuccess: () => {
          toast.success(`${memberName}님의 투표가 변경되었습니다.`);
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(`변경 실패: ${error.message}`);
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedVote(currentVote && currentVote !== 'PENDING' ? currentVote : undefined);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {memberName}님 투표 변경
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <RadioGroup
            value={selectedVote}
            onValueChange={(value) => setSelectedVote(value as TeamVoteStatusValue)}
            className="space-y-1"
          >
            {TEAM_VOTE_OPTIONS.map((option) => {
              const isSelected = selectedVote === option.value;

              return (
                <div
                  key={option.value}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => setSelectedVote(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedVote(option.value);
                    }
                  }}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all',
                    isSelected
                      ? 'border-slate-900 bg-white'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {option.label}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                      isSelected
                        ? 'border-slate-900 bg-slate-900'
                        : 'border-slate-300'
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              );
            })}
          </RadioGroup>

          <Button
            onClick={handleSubmit}
            disabled={!selectedVote || isPending}
            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90"
          >
            {isPending ? '변경 중...' : '변경하기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
