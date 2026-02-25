'use client';

import { useState } from 'react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { Button } from '@/shared/ui/shadcn/button';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select';
import {
  POSITION_DEFAULT,
  POSITION_OPTIONS,
  type PositionValue,
} from '@/shared/config/match-constants';
import { useAuth } from '@/shared/session';
import { useAddTeamVoteGuest } from '@/features/team/api/match/mutations';
import { VotingAccordion } from './voting-accordion';
import type { TeamVoteDTO, VotingSummary } from '@/features/team/model/types';

interface TeamVotingSectionProps {
  votes: TeamVoteDTO[];
  votingSummary?: VotingSummary;
  isAdmin: boolean;
  matchId: string;
  isVotingClosed: boolean;
  isLoading: boolean;
  canQuickAddGuest?: boolean;
}

export function TeamVotingSection({
  votes,
  votingSummary,
  isAdmin,
  matchId,
  isVotingClosed,
  isLoading,
  canQuickAddGuest = false,
}: TeamVotingSectionProps) {
  const { user } = useAuth();
  const addTeamVoteGuest = useAddTeamVoteGuest();
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPosition, setGuestPosition] = useState<PositionValue>(POSITION_DEFAULT);

  const handleAddGuest = () => {
    const trimmedName = guestName.trim();
    if (!trimmedName) {
      toast.error('게스트 이름을 입력해주세요.');
      return;
    }

    if (!user?.id) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    addTeamVoteGuest.mutate(
      {
        matchId,
        ownerUserId: user.id,
        guestName: trimmedName,
        guestPosition,
      },
      {
        onSuccess: () => {
          toast.success(`${trimmedName} 게스트를 추가했습니다.`);
          setGuestName('');
          setGuestPosition(POSITION_DEFAULT);
          setIsAddGuestOpen(false);
        },
      }
    );
  };

  return (
    <section className="bg-white px-5 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          투표 현황
          {votingSummary && (
            <span className="text-sm font-normal text-slate-500">
              ({votingSummary.attending + votingSummary.late}명 참석 / {votingSummary.totalMembers}명)
            </span>
          )}
        </h2>

        {canQuickAddGuest && (
          <button
            type="button"
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:text-slate-400"
            onClick={() => setIsAddGuestOpen(true)}
            disabled={isVotingClosed}
          >
            게스트 추가
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      ) : (
        <VotingAccordion
          votes={votes}
          votingSummary={votingSummary}
          isAdmin={isAdmin}
          matchId={matchId}
          isVotingClosed={isVotingClosed}
        />
      )}

      {canQuickAddGuest && (
        <Dialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen}>
          <DialogContent size="base" className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>게스트 추가</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="quick-guest-name">이름</Label>
                <Input
                  id="quick-guest-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="게스트 이름 입력"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quick-guest-position">포지션</Label>
                <Select
                  value={guestPosition}
                  onValueChange={(value) => setGuestPosition(value as PositionValue)}
                >
                  <SelectTrigger id="quick-guest-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITION_OPTIONS.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  게스트 상태는 내 투표 상태를 그대로 따릅니다.
                </p>
              </div>

              <Button
                type="button"
                className="w-full h-11 font-bold"
                onClick={handleAddGuest}
                disabled={addTeamVoteGuest.isPending}
              >
                {addTeamVoteGuest.isPending ? '추가 중...' : '추가하기'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
