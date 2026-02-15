'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Navigation, Shield } from 'lucide-react';
import { Card } from '@/shared/ui/shadcn/card';
import { Badge } from '@/shared/ui/base/badge';
import { Button } from '@/shared/ui/shadcn/button';
import { cn } from '@/shared/lib/utils';
import {
  MATCH_STATUS_LABELS,
  MATCH_STATUS_STYLES,
  type MatchStatusValue,
} from '@/shared/config/match-constants';
import {
  TEAM_VOTE_STATUS_LABELS,
  TEAM_VOTE_STATUS_STYLES,
  type TeamVoteStatusValue,
} from '@/shared/config/team-constants';
import { VoteDialog } from './vote-dialog';

interface TeamMatchItemProps {
  id: string;
  teamId: string;
  teamName: string;
  teamLogoUrl?: string | null;
  date: string; // "2026. 02. 08 (일)"
  time: string; // "19:00"
  gymName: string;
  gymAddress?: string;
  status: MatchStatusValue;
  myVote?: TeamVoteStatusValue;
  myVoteReason?: string;
  votingSummary: {
    attending: number;
    notAttending: number;
    pending: number;
  };
  onVote?: (vote: TeamVoteStatusValue, reason: string) => void;
  isVoting?: boolean;
  className?: string;
}

/**
 * 팀 매치 아이템 컴포넌트
 * - 미투표 경기 목록에서 사용
 * - 투표 현황 표시
 */
export function TeamMatchItem({
  id,
  teamId,
  teamName,
  date,
  time,
  gymName,
  gymAddress,
  status,
  myVote,
  myVoteReason,
  votingSummary,
  onVote,
  isVoting = false,
  className,
}: TeamMatchItemProps) {
  const router = useRouter();
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);

  const handleClick = () => {
    router.push(`/team/${teamId}/matches/${id}`);
  };

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVoteDialogOpen(true);
  };

  const handleVoteSubmit = (vote: TeamVoteStatusValue, reason: string) => {
    onVote?.(vote, reason);
    setIsVoteDialogOpen(false);
  };

  const statusLabel = MATCH_STATUS_LABELS[status];
  const statusStyle = MATCH_STATUS_STYLES[status];
  const hasVoted = myVote && myVote !== 'PENDING';

  return (
    <>
      <Card
        onClick={handleClick}
        className={cn(
          'p-4 cursor-pointer hover:shadow-md transition-all',
          'ring-slate-200 rounded-2xl gap-0',
          className
        )}
      >
        {/* 상단 뱃지 영역 */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {/* 모집 상태 뱃지 */}
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-medium border',
                statusStyle.color,
                statusStyle.bgColor
              )}
            >
              {statusLabel}
            </Badge>

            {/* 미투표 뱃지 */}
            {!hasVoted && (
              <Badge
                variant="outline"
                className="text-xs font-medium border bg-yellow-50 text-yellow-600 border-yellow-200"
              >
                미투표
              </Badge>
            )}
          </div>
        </div>

        {/* 날짜 및 시간 */}
        <div className="flex items-center gap-1.5 mb-1">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-lg text-slate-900">{date}</span>
          <Clock className="w-4 h-4 text-slate-400 ml-1" />
          <span className="font-semibold text-lg text-slate-900">{time}</span>
        </div>

        {/* 체육관 정보 */}
        <div className="flex items-center gap-1.5 mb-1">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-base font-medium text-slate-900">{gymName}</span>
          {gymAddress && (
            <Navigation className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>

        {/* 팀 정보 */}
        <div className="flex items-center gap-1 text-base text-slate-500 mb-2">
          <Shield className="w-4 h-4" />
          <span>{teamName}</span>
        </div>

        {/* 투표 현황 및 버튼 */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-4 text-sm">
            <span>
              참석{' '}
              <strong className="text-green-600">{votingSummary.attending}명</strong>
            </span>
            <span>
              불참{' '}
              <strong className="text-red-500">{votingSummary.notAttending}명</strong>
            </span>
            <span>
              미투표{' '}
              <strong className="text-slate-600">{votingSummary.pending}명</strong>
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            className={cn(
              'h-8 px-3 text-xs font-bold',
              hasVoted && TEAM_VOTE_STATUS_STYLES[myVote!].color,
              hasVoted && TEAM_VOTE_STATUS_STYLES[myVote!].borderColor
            )}
            onClick={handleVoteClick}
          >
            {hasVoted ? TEAM_VOTE_STATUS_LABELS[myVote!] : '투표하기'}
          </Button>
        </div>
      </Card>

      <VoteDialog
        open={isVoteDialogOpen}
        onOpenChange={setIsVoteDialogOpen}
        currentVote={myVote}
        currentReason={myVoteReason}
        onSubmit={handleVoteSubmit}
        isSubmitting={isVoting}
      />
    </>
  );
}
