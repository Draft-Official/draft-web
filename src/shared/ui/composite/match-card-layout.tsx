'use client';

import { Calendar, Clock, MapPin, Navigation, Shield } from 'lucide-react';
import { Separator } from '@/shared/ui/shadcn/separator';
import { cn } from '@/shared/lib/utils';

interface MatchCardLayoutProps {
  date: string;
  time: string;
  gymName: string;
  gymAddress?: string;
  teamName: string;
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
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-lg text-slate-900">{date}</span>
            <Clock className="w-4 h-4 text-slate-400 ml-1" />
            <span className="font-semibold text-lg text-slate-900">{time}</span>
          </div>

          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            {onLocationClick ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLocationClick();
                }}
                className="text-slate-900 hover:text-slate-700 text-left flex items-center gap-1 group text-lg font-medium"
              >
                <span>{gymName}</span>
                <Navigation className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
              </button>
            ) : (
              <>
                <span className="text-lg font-medium text-slate-900">{gymName}</span>
                {gymAddress && (
                  <Navigation className="w-3.5 h-3.5 text-slate-400" />
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-1 text-base text-slate-500">
            <Shield className="w-4 h-4" />
            <span>{teamName}</span>
          </div>
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
