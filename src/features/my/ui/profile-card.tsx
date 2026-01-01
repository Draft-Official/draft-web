'use client';

import React from 'react';
import { User, ChevronRight } from 'lucide-react';

export function ProfileCard() {
  return (
    <div className="bg-white px-5 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Avatar Placeholder */}
          <div className="w-[60px] h-[60px] rounded-full bg-slate-100 flex items-center justify-center border border-slate-100">
            <User className="w-8 h-8 text-slate-300" />
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-bold text-[#191F28]">Guest123</span>
              <ChevronRight className="w-5 h-5 text-[#B0B8C1]" />
            </div>
            <span className="text-[14px] text-[#8B95A1] font-medium">내 정보 수정</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center bg-[#F9FAFB] rounded-xl py-4">
        <div className="flex-1 flex flex-col items-center border-r border-[#E5E8EB]">
          <span className="text-[13px] text-[#8B95A1] mb-1">매너온도</span>
          <span className="text-[16px] font-bold text-[#FF6600]">36.5°C</span>
        </div>
        <div className="flex-1 flex flex-col items-center border-r border-[#E5E8EB]">
          <span className="text-[13px] text-[#8B95A1] mb-1">경기 수</span>
          <span className="text-[16px] font-bold text-[#191F28]">12</span>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[13px] text-[#8B95A1] mb-1">MVP</span>
          <span className="text-[16px] font-bold text-[#191F28]">2</span>
        </div>
      </div>
    </div>
  );
}
