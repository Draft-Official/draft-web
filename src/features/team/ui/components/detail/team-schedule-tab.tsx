'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/shared/ui/shadcn/card';
import { Button } from '@/shared/ui/shadcn/button';
import { cn } from '@/shared/lib/utils';
import type { Match } from '@/shared/types/database.types';

interface TeamScheduleTabProps {
  teamCode: string;
  matches: Match[];
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

  const handleMatchClick = (matchId: string) => {
    router.push(`/team/${teamCode}/matches/${matchId}`);
  };

  if (isLoading) {
    return (
      <div className="px-5 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="px-5 py-16 flex flex-col items-center justify-center text-center">
        <Calendar className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-slate-500 text-base">아직 일정이 없습니다</p>
        <p className="text-slate-400 text-sm mt-1">팀 운동을 생성해보세요</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* 매치 리스트 */}
      <div className="px-5 py-4 space-y-3">
        {currentMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onClick={() => handleMatchClick(match.id)}
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

// 매치 카드 컴포넌트
interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

function MatchCard({ match, onClick }: MatchCardProps) {
  // 날짜/시간 포맷
  const startDate = new Date(match.start_time);
  const dateStr = formatDate(startDate);
  const timeStr = formatTime(match.start_time);

  // 체육관 정보
  const gym = (match as Match & { gyms?: { name: string; address?: string } }).gyms;
  const gymName = gym?.name || '장소 미정';

  // 지난 경기 여부
  const isPast = startDate < new Date();

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-4 cursor-pointer hover:shadow-md transition-all',
        'ring-slate-200 rounded-xl gap-0',
        isPast && 'opacity-60'
      )}
    >
      {/* 날짜/시간 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-slate-900">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-semibold">{dateStr}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* 장소 */}
      <div className="flex items-center gap-1.5 text-slate-600">
        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="truncate">{gymName}</span>
      </div>
    </Card>
  );
}

// 날짜 포맷 헬퍼
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[date.getDay()];
  return `${year}. ${month}. ${day} (${dayName})`;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
