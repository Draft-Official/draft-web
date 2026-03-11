'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { Button } from '@/shared/ui/shadcn/button';
import { toast } from '@/shared/ui/shadcn/sonner';
import { useUpdateMemberVote } from '@/features/team/api/match/mutations';
import { TeamVoteRadioGroup } from '@/shared/ui/composite/team-vote-radio-group';
import { type TeamVoteStatusValue } from '@/shared/config/team-constants';

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
      <DialogContent size="lg" className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {memberName}님 투표 변경
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <TeamVoteRadioGroup
            value={selectedVote}
            onValueChange={setSelectedVote}
          />

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
