'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/shadcn/avatar';
import { cn } from '@/shared/lib/utils';
import type { ApplicationStatusValue } from '@/shared/config/application-constants';
import { getDayLabel } from '@/features/match/lib/utils';
import { formatShortAddress } from '@/shared/lib/parse-region';
import type { GuestMatchListItemDTO } from '@/features/match/model/types';
import { PositionChip } from './position-chip';

interface MatchListItemProps {
  match: GuestMatchListItemDTO;
  applicationStatus?: ApplicationStatusValue;
}

// 신청 상태별 Badge 설정
const STATUS_BADGE_CONFIG: Record<string, { label: string; variant: 'warning' | 'info' | 'success' }> = {
  PENDING: { label: '승인대기', variant: 'warning' },
  PAYMENT_PENDING: { label: '입금대기', variant: 'info' },
  CONFIRMED: { label: '참여확정', variant: 'success' },
};

export const MatchListItem = React.memo(function MatchListItem({ match, applicationStatus }: MatchListItemProps) {
  const router = useRouter();
  const hasPositionChips = Boolean(
    match.positions.all ||
    match.positions.g ||
    match.positions.f ||
    match.positions.c ||
    match.positions.bigman
  );

  const handleClick = () => {
    router.push(`/matches/${match.publicId}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative border-b border-slate-100 bg-white transition-all cursor-pointer flex flex-col px-4 py-3",
        match.isClosed
          ? "bg-slate-50/50"
          : "hover:bg-slate-50"
      )}
    >
      {/* 1. Top Section: Title + Location (Left) & Price (Right) */}
      <div className="flex justify-between items-start mb-0.5">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <h3 className={cn(
            "font-bold truncate leading-tight text-[17px]",
            match.isClosed ? "text-slate-400" : "text-slate-900"
          )}>
            {match.gymName}
          </h3>
          
          <span
            className={cn(
              "flex items-center gap-0.5 text-sm truncate",
              match.isClosed ? "text-slate-300" : "text-slate-700 active:text-primary"
            )}
            onClick={(e) => {
              e.stopPropagation();
              const url = `https://map.kakao.com/link/search/${encodeURIComponent(match.gymAddress)}`;
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
          >
            <MapPin className={cn(
              "w-3 h-3 shrink-0",
              match.isClosed ? "text-slate-300" : "text-slate-400"
            )} />
            {formatShortAddress(match.gymAddress)}
          </span>
          
          {/* NEW Badge (마감 경기에는 미표시) */}
          {match.isNew && !match.isClosed && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-[18px]">
              NEW
            </Badge>
          )}
        </div>

        <div className={cn(
          "text-base font-bold text-slate-900 mt-0.5 shrink-0 ml-2",
          match.isClosed && "text-slate-400 font-normal"
        )}>
          {match.priceDisplay}
        </div>
      </div>

      {/* 2. Middle Section: Date + Time, Position Chips */}
      <div className="flex flex-col justify-center min-w-0 mb-1">
        <div className="flex items-center gap-2 mb-0.5">
          {/* Date */}
          <span className={cn(
            "text-[16px] font-bold tracking-tight text-slate-900",
            match.isClosed && "text-slate-400"
          )}>
            {getDayLabel(match.dateISO)}
          </span>
          {/* Time */}
          <span className={cn(
            "text-[16px] font-bold tracking-tight text-slate-900",
            match.isClosed && "text-slate-400"
          )}>
            {match.startTime}
          </span> 
        </div>
        
        {/* Position Chips */}
        <div className={cn(
          "flex flex-wrap gap-1.5 mt-1",
          match.isClosed && "opacity-50"
        )}>
          {hasPositionChips ? (
            <>
              {match.positions.all && (
                <PositionChip
                  label="포지션 무관"
                  status={match.positions.all.status}
                  max={match.positions.all.max}
                  current={match.positions.all.current}
                  matchClosed={match.isClosed}
                />
              )}
              {match.positions.g && (
                <PositionChip
                  label="가드"
                  status={match.positions.g.status}
                  max={match.positions.g.max}
                  current={match.positions.g.current}
                  matchClosed={match.isClosed}
                />
              )}
              {match.positions.f && (
                <PositionChip
                  label="포워드"
                  status={match.positions.f.status}
                  max={match.positions.f.max}
                  current={match.positions.f.current}
                  matchClosed={match.isClosed}
                />
              )}
              {match.positions.c && (
                <PositionChip
                  label="센터"
                  status={match.positions.c.status}
                  max={match.positions.c.max}
                  current={match.positions.c.current}
                  matchClosed={match.isClosed}
                />
              )}
              {match.positions.bigman && (
                <PositionChip
                  label="빅맨(F/C)"
                  status={match.positions.bigman.status}
                  max={match.positions.bigman.max}
                  current={match.positions.bigman.current}
                  matchClosed={match.isClosed}
                />
              )}
            </>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] border border-slate-300 text-[11px] h-[22px] font-medium text-slate-900 whitespace-nowrap">
              {match.positionsDisplay}
            </span>
          )}
        </div>
      </div>

      {/* 3. Bottom Section: Team (Left) & Button/Badge (Right) */}
      <div className="flex items-center justify-between">
        {/* Team Information */}
        {match.teamName ? (
          <div className="flex items-start gap-2">
            <Avatar className="w-6 h-6">
              {!match.teamId ? (
                <>
                  <AvatarImage src="/logos/preset/logo-01.webp" alt="기본 팀 로고" />
                  <AvatarFallback className="bg-slate-200 text-xs text-slate-500 font-bold">
                    {match.teamName.slice(0, 1)}
                  </AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarImage src={match.teamLogo ?? undefined} alt={match.teamName} />
                  <AvatarFallback className="bg-slate-200 text-xs text-slate-500 font-bold">
                    {match.teamName.slice(0, 1)}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <span className={cn(
              "text-sm font-bold text-slate-900",
              match.isClosed && "opacity-50"
            )}>
              {match.teamName}
            </span>
          </div>
        ) : (
          <div /> 
        )}

        {/* Button or Badge */}
        <div className="flex shrink-0 ml-2">
          {match.isClosed ? (
            <Badge variant="secondary" className="h-8 px-3 text-xs font-bold rounded-lg">
              모집 마감
            </Badge>
          ) : applicationStatus && STATUS_BADGE_CONFIG[applicationStatus] ? (
            <Badge
              variant={STATUS_BADGE_CONFIG[applicationStatus].variant}
              className="h-8 px-3 text-xs font-bold rounded-lg"
            >
              {STATUS_BADGE_CONFIG[applicationStatus].label}
            </Badge>
          ) : (
            <Button
              size="sm"
              className="h-8 px-3 text-xs font-bold rounded-lg shadow-sm transition-transform active:scale-95 bg-primary hover:bg-primary/90 text-white shadow-draft-100"
            >
              신청하기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
