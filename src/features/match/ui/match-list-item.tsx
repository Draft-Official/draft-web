'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { Match } from '../model/mock-data';
import { PositionChip } from './position-chip';

interface MatchListItemProps {
  match: Match;
  showDate?: boolean;
  getShortDayLabel?: (iso: string) => string;
}

/**
 * Match list item with 3-column layout (Figma Make strict implementation)
 */
export function MatchListItem({ match, showDate, getShortDayLabel }: MatchListItemProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/guest/${match.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center py-[14px] px-5 border-b border-[#F2F4F6] bg-white transition-all cursor-pointer min-h-[84px]",
        match.isClosed
          ? "bg-[#FAFAFB]" // Gray background for closed
          : "active:bg-slate-50"
      )}
    >
      {/* 
        [Left Column] Time Info 
        Width: 52px (Compact)
      */}
      <div className="w-[52px] flex flex-col items-center justify-center shrink-0 mr-3">
        {/* Date Label (only when viewing all dates) */}
        {showDate && getShortDayLabel && (
          <span
            className={cn(
              "text-[10px] leading-none mb-1.5 text-center font-medium",
              match.isClosed ? "text-[#ADB5BD]" : "text-[#8B95A1]"
            )}
          >
            {getShortDayLabel(match.dateISO)}
          </span>
        )}

        {/* Start Time (Bold) */}
        <span
          className={cn(
            "text-[17px] font-bold leading-none tracking-tight text-center mb-1",
            match.isClosed ? "text-[#ADB5BD]" : "text-[#191F28]"
          )}
        >
          {match.startTime}
        </span>

        {/* End Time (Regular) */}
        <span
          className={cn(
            "text-[11px] font-medium leading-none text-center",
            match.isClosed ? "text-[#ADB5BD]" : "text-[#8B95A1]"
          )}
        >
          ~{match.endTime}
        </span>
      </div>

      {/* 
        [Center Column] Match Info 
        Flex-grow to fill space
      */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-[5px]">
        <div>
          {/* Title Row with Closed Badge */}
          <div className="flex items-center gap-[6px] mb-[2px]">
            <h3
              className={cn(
                "text-[15px] font-bold truncate leading-tight min-w-0 tracking-tight",
                match.isClosed ? "text-[#ADB5BD]" : "text-[#191F28]"
              )}
            >
              {match.title}
            </h3>
            {/* Closed Badge - Only shown when closed */}
            {match.isClosed && (
              <span className="inline-flex items-center justify-center bg-[#F2F4F6] text-[#ADB5BD] text-[10px] font-bold px-1.5 py-[3px] rounded-[4px] leading-none shrink-0 border border-[#E5E8EB]">
                마감
              </span>
            )}
          </div>

          {/* Location */}
          <div
            className={cn(
              "text-[12px] truncate font-medium",
              match.isClosed ? "text-[#ADB5BD]" : "text-[#8B95A1]"
            )}
          >
            {match.location}
          </div>
        </div>

        {/* Position Chips Row */}
        {!match.isClosed && (
          <div className="flex flex-wrap gap-[5px]">
            {match.positions.all ? (
              <PositionChip
                label="무관"
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
        )}
      </div>

      {/* 
        [Right Column] Price 
        Shrink-0 to prevent wrapping
      */}
      <div className="shrink-0 ml-1 flex flex-col items-end justify-center gap-0.5 min-w-[50px]">
        <span
          className={cn(
            "text-[16px] font-bold leading-none tracking-tight",
            match.isClosed ? "text-[#ADB5BD]" : "text-[#191F28]"
          )}
        >
          {match.price}
        </span>
        <span
          className={cn(
            "text-[11px] leading-none font-medium",
            match.isClosed ? "text-[#ADB5BD]" : "text-[#8B95A1]"
          )}
        >
          원
        </span>
      </div>
    </div>
  );
}
