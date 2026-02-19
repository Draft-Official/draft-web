'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { RadioGroup } from '@/shared/ui/shadcn/radio-group';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { Button } from '@/shared/ui/shadcn/button';
import { cn } from '@/shared/lib/utils';
import {
  TEAM_VOTE_OPTIONS,
  type TeamVoteStatusValue,
} from '@/shared/config/team-constants';

interface VoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentVote?: TeamVoteStatusValue;
  currentReason?: string;
  onSubmit: (vote: TeamVoteStatusValue, reason: string) => void;
  isSubmitting?: boolean;
}

export function VoteDialog({
  open,
  onOpenChange,
  currentVote,
  currentReason = '',
  onSubmit,
  isSubmitting = false,
}: VoteDialogProps) {
  const [selectedVote, setSelectedVote] = useState<TeamVoteStatusValue | undefined>(
    currentVote && currentVote !== 'PENDING' ? currentVote : undefined
  );
  const [reason, setReason] = useState(currentReason);

  const handleSubmit = () => {
    if (selectedVote) {
      onSubmit(selectedVote, reason);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset to current values when closing
      setSelectedVote(currentVote && currentVote !== 'PENDING' ? currentVote : undefined);
      setReason(currentReason);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">참석 여부를 선택해주세요</DialogTitle>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              사유 (선택)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="불참 또는 미정 사유를 입력해주세요"
              className="resize-none h-24"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedVote || isSubmitting}
            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? '저장 중...' : '투표하기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
