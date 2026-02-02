'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/base/button';
import { Badge } from '@/shared/ui/base/badge';
import { cn } from '@/shared/lib/utils';
import { MATCH_FORMAT_LABELS, MatchFormatValue, ApplicationStatusValue } from '@/shared/config/constants';
import { getDayLabel, isNewMatch } from '@/features/match/lib/utils';

interface Match {
  id: string;
  dateISO: string;
  startTime: string;
  endTime: string;
  price: string;
  priceNum?: number;
  title: string;
  teamName?: string;
  teamLogo?: string;
  isPersonalHost?: boolean; // 개인 주최 여부
  location: string;
  gender: 'MALE' | 'FEMALE' | 'MIXED';
  matchFormat: MatchFormatValue; // e.g. "FIVE_ON_FIVE"
  isClosed?: boolean;
  createdAt?: string; // NEW 뱃지용
  positions: {
    all?: { status: 'open' | 'closed'; max: number; current: number };
    g?: { status: 'open' | 'closed'; max: number; current: number };
    f?: { status: 'open' | 'closed'; max: number; current: number };
    c?: { status: 'open' | 'closed'; max: number; current: number };
  };
}

interface MatchListItemProps {
  match: Match;
  applicationStatus?: ApplicationStatusValue; // 사용자 신청 상태
}

// --- Constants (대문자 키 사용 - DB와 동일) ---
const GENDER_CONFIG: Record<string, { label: string; className: string }> = {
  MALE: { label: '남성', className: 'text-blue-600 bg-blue-50 border-blue-200' },
  FEMALE: { label: '여성', className: 'text-pink-600 bg-pink-50 border-pink-200' },
  MIXED: { label: '성별 무관', className: 'text-purple-600 bg-purple-50 border-purple-200' },
};

// --- Position Chip Component ---
const PositionChip = ({ label, max, current, status }: { label: string; max: number; current: number; status?: 'open' | 'closed' }) => {
  const isClosed = status === 'closed';

  return (
    <div className={cn(
      "flex items-center justify-center px-2 py-0.5 rounded-[6px] border text-[11px] h-[22px] font-medium transition-colors whitespace-nowrap",
      isClosed
        ? "bg-slate-100 border-slate-100 text-slate-400"
        : "bg-white border-slate-300 text-slate-900"
    )}>
      <span className="leading-none tracking-tight">
        {label} <span className={cn("ml-0.5", isClosed ? "text-slate-400" : "text-[#FF6600] font-bold")}>{current}</span><span className="text-slate-300">/</span>{max}
      </span>
    </div>
  );
};

// 신청 상태별 Badge 설정
const STATUS_BADGE_CONFIG: Record<string, { label: string; variant: 'warning' | 'info' | 'success' }> = {
  PENDING: { label: '승인대기', variant: 'warning' },
  PAYMENT_PENDING: { label: '입금대기', variant: 'info' },
  CONFIRMED: { label: '참여확정', variant: 'success' },
};

export const MatchListItem = React.memo(function MatchListItem({ match, applicationStatus }: MatchListItemProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/matches/${match.id}`);
  };

  const genderInfo = GENDER_CONFIG[match.gender];

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
            {match.title}
          </h3>
          
          <span className={cn(
            "flex items-center gap-0.5 text-sm truncate",
            match.isClosed ? "text-slate-300" : "text-slate-700"
          )}>
            <MapPin className={cn(
              "w-3 h-3 shrink-0",
              match.isClosed ? "text-slate-300" : "text-slate-400"
            )} />
            {match.location}
          </span>
          
          {/* NEW Badge */}
          {isNewMatch(match.createdAt) && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-[18px]">
              NEW
            </Badge>
          )}
        </div>

        <div className={cn(
          "text-base font-bold text-slate-900 mt-0.5 shrink-0 ml-2",
          match.isClosed && "text-slate-400 font-normal"
        )}>
          {match.price}
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
          {match.positions.all ? (
            <PositionChip
              label="포지션 무관"
              max={match.positions.all.max}
              current={match.positions.all.current}
              status={match.positions.all.status}
            />
          ) : (
            <>
              {match.positions.g && (
                <PositionChip
                  label="가드"
                  max={match.positions.g.max}
                  current={match.positions.g.current}
                  status={match.positions.g.status}
                />
              )}
              {match.positions.f && (
                <PositionChip
                  label="포워드"
                  max={match.positions.f.max}
                  current={match.positions.f.current}
                  status={match.positions.f.status}
                />
              )}
              {match.positions.c && (
                <PositionChip
                  label="센터"
                  max={match.positions.c.max}
                  current={match.positions.c.current}
                  status={match.positions.c.status}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* 3. Bottom Section: Team (Left) & Button/Badge (Right) */}
      <div className="flex items-center justify-between">
        {/* Team Information */}
        {match.teamName ? (
          <div className="flex items-center gap-2">
            {match.isPersonalHost ? (
              <span className="text-xl leading-none">🏀</span>
            ) : (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0">
                {match.teamLogo ? (
                  <img src={match.teamLogo} alt={match.teamName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-xs text-slate-500 font-bold">
                    {match.teamName.slice(0, 1)}
                  </div>
                )}
              </div>
            )}
            <span className={cn(
              "text-sm font-semibold text-slate-700",
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
            <Badge variant="secondary" className="h-8 px-3 text-xs font-bold">
              모집 마감
            </Badge>
          ) : applicationStatus && STATUS_BADGE_CONFIG[applicationStatus] ? (
            <Badge
              variant={STATUS_BADGE_CONFIG[applicationStatus].variant}
              className="h-8 px-3 text-xs font-bold"
            >
              {STATUS_BADGE_CONFIG[applicationStatus].label}
            </Badge>
          ) : (
            <Button
              size="sm"
              className="h-8 px-3 text-xs font-bold rounded-lg shadow-sm transition-transform active:scale-95 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white shadow-orange-100"
            >
              신청하기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
