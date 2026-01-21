'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { Match } from '@/features/match/model/mock-data';

interface HeroSectionProps {
  match: Match;
}

export function HeroSection({ match }: HeroSectionProps) {
  const genderLabel = {
    men: '남성',
    women: '여성',
    mixed: '성별 무관'
  }[match.gender] || match.gender;

  const isClosed = match.positions.all?.status === 'closed';

  return (
    <div className="bg-white px-5 pt-6 pb-6 relative">
      
      {/* 0. Main Title (Team Name) */}
      <h1 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
        {match.teamName}에서 게스트 모집합니다!
      </h1>

      {/* 1. Date Time & Share */}
      <div className="flex justify-between items-start mb-1">
        <h2 className="text-lg font-bold text-slate-900 leading-tight pr-4">
            {(() => {
                const d = new Date(match.dateISO);
                const month = d.getMonth() + 1;
                const date = d.getDate();
                const day = ['일','월','화','수','목','금','토'][d.getDay()];
                return `${month}월 ${date}일 (${day}) ${match.startTime} ~ ${match.endTime}`;
            })()}
        </h2>
        {/* Share Button Placeholder if needed, or just keep layout */}
        {/* <button className="shrink-0 w-8 h-8 ..."><Share2/></button> */}
      </div>

      {/* 2. Gym Name */}
      <div className="flex items-center gap-2 mb-1">
        <div className="text-[20px] font-bold text-slate-700 tracking-tight">
            {match.location}
        </div>
        <button 
            onClick={() => {
                document.getElementById('facility-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-[11px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors"
        >
            편의시설 정보
        </button>
      </div>

      {/* 3. Address Tools */}
      <div className="flex items-center flex-wrap gap-x-2 text-[13px] mb-4">
          <span className="text-slate-500">{match.address}</span>
          <span className="text-slate-300">|</span>
          <button 
            onClick={() => {
                navigator.clipboard.writeText(match.address);
            }}
            className="text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-2"
          >
              주소복사
          </button>
          <button className="text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-2">
              지도보기
          </button>
      </div>

      {/* Divider */}
      <hr className="border-slate-100 mb-4" />

      {/* 4. Price (Floating Badge) */}
      <div className="flex items-center gap-3 mt-7">
          <span className="text-xs font-medium text-slate-500 self-center mb-0.5">참가비</span>
          <div className="relative">
            {/* Speech Bubble Badge */}
            <div className="absolute -top-6 left-0 px-2 py-0.5 bg-[#FF6600] rounded-full shadow-sm whitespace-nowrap z-10">
                <span className="text-[10px] font-bold text-white tracking-wide block">
                물/음료 제공
                </span>
                {/* Tail */}
                <div className="absolute left-3 bottom-[-3px] w-1.5 h-1.5 bg-[#FF6600] rotate-45"></div>
            </div>

            {/* Price Text */}
            <div className="flex items-baseline">
                <span className="text-xl font-bold text-slate-900">
                    {match.price}
                </span>
                <span className="text-xs text-slate-400 ml-1.5">/ 2시간</span>
            </div>
          </div>
      </div>
    </div>
  );
}
