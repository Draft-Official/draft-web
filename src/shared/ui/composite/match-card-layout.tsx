'use client';

import { Calendar, MapPin, Navigation } from 'lucide-react';
import { Separator } from '@/shared/ui/shadcn/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/shadcn/avatar';
import { cn } from '@/shared/lib/utils';

interface MatchCardLayoutProps {
  date: string;
  time: string;
  gymName: string;
  gymAddress?: string;
  teamName: string;
  teamLogoUrl?: string | null;
  showTeamName?: boolean;
  onClick?: () => void;
  onLocationClick?: () => void;
  isPast?: boolean;
  className?: string;
  topSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
  headerSlot?: React.ReactNode;
}

export function MatchCardLayout({
  date,
  time,
  gymName,
  gymAddress,
  teamName,
  teamLogoUrl,
  showTeamName = true,
  onClick,
  onLocationClick,
  isPast,
  className,
  topSlot,
  bottomSlot,
  headerSlot,
}: MatchCardLayoutProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all cursor-pointer hover:shadow-md',
        isPast && 'opacity-50 grayscale',
        className
      )}
    >
      {headerSlot}

      <div className="p-4 space-y-3">
        {topSlot && (
          <div className="flex items-center justify-between">
            {topSlot}
          </div>
        )}

        {/* 본문 - 날짜, 시간, 체육관, 팀 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            <span className="font-semibold text-lg text-slate-900">{date}{'\u00A0\u00A0'}{time}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            {onLocationClick ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLocationClick();
                }}
                className="text-slate-900 hover:text-slate-700 text-left flex items-center gap-1.5 group text-lg font-semibold"
              >
                <span>{gymName}</span>
                <Navigation className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
              </button>
            ) : (
              <>
                <span className="text-lg font-semibold text-slate-900">{gymName}</span>
                {gymAddress && (
                  <Navigation className="w-5 h-5 text-slate-400" />
                )}
              </>
            )}
          </div>

          {showTeamName && (
            <div className="flex items-center gap-2 text-lg">
              <Avatar className="w-6 h-6 shrink-0">
                <AvatarImage src={teamLogoUrl ?? undefined} alt={teamName} />
                <AvatarFallback className="bg-slate-200 text-[9px] font-bold text-slate-500">
                  {teamName.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-slate-900">{teamName}</span>
            </div>
          )}
        </div>

        {bottomSlot && (
          <>
            <Separator className="bg-slate-100" />
            {bottomSlot}
          </>
        )}
      </div>
    </div>
  );
}
