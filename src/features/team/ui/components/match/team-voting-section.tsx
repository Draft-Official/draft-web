'use client';

import { useMemo, useState } from 'react';
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
  TEAM_VOTE_STATUS_LABELS,
  type TeamVoteStatusValue,
} from '@/shared/config/team-constants';
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

const QUICK_ADD_STATUS_OPTIONS: TeamVoteStatusValue[] = [
  'PENDING',
  'CONFIRMED',
  'LATE',
  'NOT_ATTENDING',
  'MAYBE',
];

function toVotingSummary(votes: TeamVoteDTO[]): VotingSummary {
  const summary = {
    pending: 0,
    attending: 0,
    late: 0,
    maybe: 0,
    notAttending: 0,
    totalMembers: votes.length,
  };

  votes.forEach((vote) => {
    switch (vote.status) {
      case 'CONFIRMED':
        summary.attending += 1;
        break;
      case 'LATE':
        summary.late += 1;
        break;
      case 'NOT_ATTENDING':
        summary.notAttending += 1;
        break;
      case 'MAYBE':
        summary.maybe += 1;
        break;
      case 'PENDING':
      default:
        summary.pending += 1;
        break;
    }
  });

  return summary;
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
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestStatus, setGuestStatus] = useState<TeamVoteStatusValue>('PENDING');
  const [manualGuestVotes, setManualGuestVotes] = useState<TeamVoteDTO[]>([]);

  const mergedVotes = useMemo(
    () => [...votes, ...manualGuestVotes],
    [votes, manualGuestVotes]
  );
  const mergedSummary = useMemo(() => {
    if (manualGuestVotes.length === 0) return votingSummary;
    return toVotingSummary(mergedVotes);
  }, [manualGuestVotes.length, mergedVotes, votingSummary]);

  const handleAddGuest = () => {
    const trimmedName = guestName.trim();
    if (!trimmedName) {
      toast.error('게스트 이름을 입력해주세요.');
      return;
    }

    const now = new Date().toISOString();
    const tempId = `manual-guest-${Date.now()}`;

    const newGuestVote: TeamVoteDTO = {
      id: tempId,
      matchId,
      userId: tempId,
      status: guestStatus,
      source: 'TEAM_VOTE',
      description: null,
      createdAt: now,
      updatedAt: now,
      userNickname: trimmedName,
      userAvatarUrl: null,
    };

    setManualGuestVotes((prev) => [...prev, newGuestVote]);
    toast.success(`${trimmedName} 게스트를 추가했습니다.`);
    setGuestName('');
    setGuestStatus('PENDING');
    setIsAddGuestOpen(false);
  };

  return (
    <section className="bg-white px-5 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          투표 현황
          {mergedSummary && (
            <span className="text-sm font-normal text-slate-500">
              ({mergedSummary.attending + mergedSummary.late}명 참석 / {mergedSummary.totalMembers}명)
            </span>
          )}
        </h2>

        {canQuickAddGuest && (
          <button
            type="button"
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
            onClick={() => setIsAddGuestOpen(true)}
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
          votes={mergedVotes}
          votingSummary={mergedSummary}
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
                <Label htmlFor="quick-guest-status">투표 상태</Label>
                <Select
                  value={guestStatus}
                  onValueChange={(value) => setGuestStatus(value as TeamVoteStatusValue)}
                >
                  <SelectTrigger id="quick-guest-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUICK_ADD_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {TEAM_VOTE_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                className="w-full h-11 font-bold"
                onClick={handleAddGuest}
              >
                추가하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
