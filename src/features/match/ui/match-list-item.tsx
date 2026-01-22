'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/lib/utils';

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
  gender: 'men' | 'women' | 'mixed';
  gameFormat: string; // e.g. "5vs5"
  isClosed?: boolean;
  positions: {
    all?: { status: 'open' | 'closed'; max: number };
    g?: { status: 'open' | 'closed'; max: number };
    f?: { status: 'open' | 'closed'; max: number };
    c?: { status: 'open' | 'closed'; max: number };
  };
}

interface MatchListItemProps {
  match: Match;
  showDate?: boolean;
  getShortDayLabel?: (iso: string) => string;
}

// --- Constants ---
const GENDER_CONFIG: Record<string, { label: string; className: string }> = {
  men: { label: '남성', className: 'text-blue-600 bg-blue-50 border-blue-200' },
  women: { label: '여성', className: 'text-pink-600 bg-pink-50 border-pink-200' },
  mixed: { label: '성별 무관', className: 'text-purple-600 bg-purple-50 border-purple-200' },
};

// --- Position Chip Component ---
const PositionChip = ({ label, max, status }: { label: string; max: number; status?: 'open' | 'closed' }) => {
  const isClosed = status === 'closed';
  const current = isClosed ? max : 0;

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

export const MatchListItem = React.memo(function MatchListItem({ match, showDate = false, getShortDayLabel }: MatchListItemProps) {
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
      {/* 1. Top Section: Time (Left) & Price (Right) */}
      <div className="flex justify-between items-start mb-0.5">
        <div className="flex items-center gap-1.5">
          {/* Time */}
          <span className={cn(
            "text-[15px] font-bold tracking-tight text-slate-900 mr-1",
            match.isClosed && "text-slate-400"
          )}>
            {match.startTime} ~ {match.endTime}
          </span>
          
          {/* Match Type Badge */}
          <span className={cn(
            "px-1.5 py-[2px] text-[10px] font-bold border rounded-[4px] leading-none",
            match.isClosed 
              ? "bg-slate-100 border-slate-100 text-slate-400" 
              : "bg-white border-slate-300 text-slate-900"
          )}>
            {match.gameFormat}
          </span>

          {/* Gender Badge */}
          <span className={cn(
            "px-1.5 py-[2px] text-[10px] font-bold border rounded-[4px] leading-none",
            genderInfo.className
          )}>
            {genderInfo.label}
          </span>
        </div>

        <div className={cn(
          "text-sm font-bold text-slate-900 mt-0.5",
          match.isClosed && "text-slate-400 font-normal"
        )}>
          {match.price}
        </div>
      </div>

      {/* 2. Middle Section: Title, Location, Team */}
      <div className="flex flex-col justify-center min-w-0 mb-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <h3 className={cn(
            "font-bold truncate leading-tight text-[17px]",
            match.isClosed ? "text-slate-400" : "text-slate-900"
          )}>
            {match.title}
          </h3>
          <span className={cn(
            "flex items-center gap-0.5 text-xs truncate",
            match.isClosed ? "text-slate-300" : "text-slate-500"
          )}>
            <MapPin className={cn(
              "w-3 h-3 shrink-0",
              match.isClosed ? "text-slate-300" : "text-slate-400"
            )} />
            {match.location}
          </span>
        </div>
        {match.teamName && (
          <div className="flex items-center gap-2 mt-1">
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
        )}
      </div>

      {/* 3. Bottom Section: Positions (Left) & Button (Right) */}
      <div className="flex items-center justify-between">
        {/* Positions */}
        <div className={cn(
          "flex flex-wrap gap-1.5",
          match.isClosed && "opacity-50"
        )}>
          {match.positions.all ? (
            <PositionChip
              label="포지션 무관"
              max={match.positions.all.max}
              status={match.positions.all.status}
            />
          ) : (
            <>
              {match.positions.g && (
                <PositionChip
                  label="가드"
                  max={match.positions.g.max}
                  status={match.positions.g.status}
                />
              )}
              {match.positions.f && (
                <PositionChip
                  label="포워드"
                  max={match.positions.f.max}
                  status={match.positions.f.status}
                />
              )}
              {match.positions.c && (
                <PositionChip
                  label="센터"
                  max={match.positions.c.max}
                  status={match.positions.c.status}
                />
              )}
            </>
          )}
        </div>

        {/* Button */}
        <div className="flex shrink-0 ml-2">
          <Button
            size="sm"
            disabled={match.isClosed}
            className={cn(
              "h-8 px-3 text-xs font-bold rounded-lg shadow-sm transition-transform active:scale-95",
              match.isClosed
                ? "bg-slate-100 text-slate-400 shadow-none border border-slate-100"
                : "bg-[#FF6600] hover:bg-[#FF6600]/90 text-white shadow-orange-100"
            )}
          >
            {match.isClosed ? "마감" : "신청하기"}
          </Button>
        </div>
      </div>
    </div>
  );
});
