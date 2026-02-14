'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { GuestMatchDetailDTO } from '@/features/match/model/types';
import { POSITION_LABELS } from '@/shared/config/match-constants';

interface RecruitmentStatusProps {
  match: GuestMatchDetailDTO;
}

export function RecruitmentStatus({ match }: RecruitmentStatusProps) {
  const { positions } = match;

  // Build list of active positions
  const positionList: Array<{
    type: 'all' | 'g' | 'f' | 'c' | 'bigman';
    data: { status: 'open' | 'closed'; max: number; current: number };
  }> = [];

  if (positions.all) {
    positionList.push({ type: 'all', data: positions.all });
  } else {
    if (positions.g) positionList.push({ type: 'g', data: positions.g });
    if (positions.f) positionList.push({ type: 'f', data: positions.f });
    if (positions.c) positionList.push({ type: 'c', data: positions.c });
    if (positions.bigman) positionList.push({ type: 'bigman', data: positions.bigman });
  }

  const getLabel = (type: 'all' | 'g' | 'f' | 'c' | 'bigman') => {
    const labels = {
      all: '포지션 무관',
      g: POSITION_LABELS.G.full,
      f: POSITION_LABELS.F.full,
      c: POSITION_LABELS.C.full,
      bigman: POSITION_LABELS.B.full,
    };
    return labels[type];
  };

  return (
    <section className="px-5 py-5">
      <h3 className="text-lg font-bold text-slate-900 mb-4">모집 현황</h3>

      <div className="flex gap-2">
        {positionList.map(({ type, data }) => {
          const isClosed = data.status === 'closed';

          return (
            <div
              key={type}
              className={cn(
                "flex-1 flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                isClosed
                  ? "border-slate-100 opacity-60"
                  : "border-slate-200"
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                isClosed ? "text-slate-400" : "text-slate-700"
              )}>
                {getLabel(type)}
              </span>
              <div className="flex items-baseline font-bold">
                <span className={cn("text-sm", isClosed ? "text-slate-400" : "text-[#FF6600]")}>
                  {data.current}
                </span>
                <span className="text-slate-300 mx-0.5 font-normal text-sm">/</span>
                <span className="text-slate-400 font-medium text-sm">{data.max}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
