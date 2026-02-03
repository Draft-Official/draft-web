'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { Match } from '@/features/match/model/types';
import { POSITION_LABELS } from '@/shared/config/constants';

interface RecruitmentStatusProps {
  match: Match;
}

export function RecruitmentStatus({ match }: RecruitmentStatusProps) {
  const { positions } = match;

  const renderCard = (
    type: 'all' | 'g' | 'f' | 'c' | 'bigman',
    data?: { status: 'open' | 'closed'; max: number; current: number }
  ) => {
    if (!data) return null;

    const isClosed = data.status === 'closed';
    const current = data.current;

    // Use POSITION_LABELS from constants for SSOT
    // 'all' is a special case (포지션 무관) not in POSITION_LABELS
    const config = {
      all: { label: 'ALL', title: '포지션 무관', subtitle: null },
      g: { label: POSITION_LABELS.G.short, title: POSITION_LABELS.G.full, subtitle: null },
      f: { label: POSITION_LABELS.F.short, title: POSITION_LABELS.F.full, subtitle: null },
      c: { label: POSITION_LABELS.C.short, title: POSITION_LABELS.C.full, subtitle: null },
      bigman: { label: POSITION_LABELS.B.short, title: POSITION_LABELS.B.full, subtitle: null },
    }[type];

    // Styles from user snippet
    // Closed: "bg-slate-50 border-slate-100 opacity-60"
    // Open: "border-[#FF6600]/30 bg-orange-50/30"
    // Avatar: w-10 h-10
    
    return (
      <div className={cn(
        "flex items-center justify-between p-2.5 rounded-xl border mb-3 last:mb-0 transition-all",
        isClosed
          ? "bg-slate-50 border-slate-100 opacity-60"
          : "bg-orange-50/30 border-[#FF6600]/30"
      )}>
        <div className="flex items-center gap-2.5">
          {/* Avatar Icon */}
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
             isClosed
               ? "bg-slate-200 text-slate-500"
               : "bg-[#FF6600] text-white"
          )}>
            {config.label}
          </div>

          {/* Text Info (Name) */}
          <div className="flex flex-col">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 leading-none">
              <span className={isClosed ? "text-slate-700" : "text-slate-900"}>
                {config.title}
              </span>
              {/* Optional Subtitle Badge */}
              {config.subtitle && !isClosed && (
                 <span className="text-[10px] font-normal text-[#FF6600] bg-orange-100 px-1.5 py-0.5 rounded">
                    {config.subtitle}
                 </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Count (1/2) */}
        <div className="flex items-baseline font-bold">
           <span className={cn("text-base", isClosed ? "text-slate-400" : "text-[#FF6600]")}>
             {current}
           </span>
           <span className="text-slate-300 mx-0.5 font-normal text-base">/</span>
           <span className="text-slate-400 font-medium text-base">{data.max}</span>
        </div>
      </div>
    );
  };

  return (
    <section className="px-5 py-5">
      <h3 className="text-lg font-bold text-slate-900 mb-4">모집 현황</h3>
      
      <div className="space-y-3">
        {positions.all ? (
             renderCard('all', positions.all)
        ) : (
            <>
                {renderCard('g', positions.g)}
                {renderCard('f', positions.f)}
                {renderCard('c', positions.c)}
                {renderCard('bigman', positions.bigman)}
            </>
        )}
      </div>
    </section>
  );
}
