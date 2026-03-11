'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { Button } from '@/shared/ui/shadcn/button';
import { TeamVoteRadioGroup } from '@/shared/ui/composite/team-vote-radio-group';
import { type TeamVoteStatusValue } from '@/shared/config/team-constants';

interface VoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentVote?: TeamVoteStatusValue;
  currentReason?: string;
  onSubmit: (vote: TeamVoteStatusValue, reason: string) => void;
  isSubmitting?: boolean;
}

function normalizeVote(vote?: TeamVoteStatusValue) {
  return vote && vote !== 'PENDING' ? vote : undefined;
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
    normalizeVote(currentVote)
  );
  const [reason, setReason] = useState(currentReason);

  useEffect(() => {
    if (!open) return;

    setSelectedVote(normalizeVote(currentVote));
    setReason(currentReason);
  }, [open, currentVote, currentReason]);

  const handleSubmit = () => {
    if (selectedVote) {
      onSubmit(selectedVote, reason);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset to current values when closing
      setSelectedVote(normalizeVote(currentVote));
      setReason(currentReason);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="lg" className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">참석 여부를 선택해주세요</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <TeamVoteRadioGroup
            value={selectedVote}
            onValueChange={setSelectedVote}
          />

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
