'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';
import { MatchCardLayout } from '@/shared/ui/composite/match-card-layout';
import { cn } from '@/shared/lib/utils';
import type { TeamScheduleMatchItemDTO } from '@/features/team/model/types';
import { Spinner } from '@/shared/ui/shadcn/spinner';

interface TeamScheduleTabProps {
  teamCode: string;
  matches: TeamScheduleMatchItemDTO[];
  isLoading?: boolean;
}

const PAGE_SIZE = 10;

/**
 * 팀 일정 탭 - 매치 리스트 (페이지네이션)
 */
export function TeamScheduleTab({ teamCode, matches, isLoading }: TeamScheduleTabProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);

  // 페이지네이션 계산
  const totalPages = Math.ceil(matches.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentMatches = matches.slice(startIndex, endIndex);

  const handleMatchClick = (publicId: string) => {
    router.push(`/team/${teamCode}/matches/${publicId}`);
  };

  if (isLoading) {
    return (
      <div className="px-5 py-8 flex items-center justify-center">
        <Spinner className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="px-5 py-16 flex flex-col items-center justify-center text-center">
        <Calendar className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-slate-500 text-base">아직 일정이 없습니다</p>
        <p className="text-muted-foreground text-sm mt-1">팀 운동을 생성해보세요</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* 매치 리스트 */}
      <div className="px-5 py-4 space-y-3">
        {currentMatches.map((match) => (
          <MatchCardLayout
            key={match.matchId}
            date={match.dateDisplay}
            time={match.timeDisplay}
            gymName={match.gymName || '장소 미정'}
            gymAddress={match.gymAddress ?? undefined}
            teamName={match.teamName}
            showTeamName={false}
            isPast={match.isPast}
            onClick={() => handleMatchClick(match.publicId)}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPage(p)}
                className={cn(
                  'h-8 w-8 p-0 text-sm',
                  p === page && 'bg-primary hover:bg-primary/90'
                )}
              >
                {p}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
