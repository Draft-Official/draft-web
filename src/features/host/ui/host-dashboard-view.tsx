'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';


export function HostDashboardView() {
  const router = useRouter();

  return (
    <div className="bg-white min-h-screen">
       {/* Header */}
      <div className="h-[52px] bg-white flex items-center px-5 border-b border-[#F2F4F6]">
        <h1 className="text-[20px] font-bold text-[#191F28]">호스트 센터</h1>
      </div>

      <div className="p-5 flex flex-col gap-6">
        {/* Action Card: Create Match */}
        <button 
          onClick={() => router.push('/match/create')}
          className="w-full bg-[#FF6600] rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-orange-100 active:scale-[0.98] transition-transform"
        >
          <div className="flex flex-col items-start gap-1">
            <span className="text-white/90 text-[14px] font-medium">새로운 경기를 개설하세요</span>
            <span className="text-white text-[20px] font-bold">경기 만들기</span>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6 text-white stroke-[3]" />
          </div>
        </button>

        {/* My Matches Section */}
        <div>
           <div className="flex items-center justify-between mb-3">
             <h2 className="text-[18px] font-bold text-[#191F28]">내 경기 관리</h2>
             <button className="text-[13px] text-[#8B95A1] flex items-center">
               전체보기 <ChevronRight className="w-4 h-4" />
             </button>
           </div>

           {/* Empty State / List */}
           <div className="bg-[#F9FAFB] rounded-xl py-10 flex flex-col items-center justify-center text-center">
             <Calendar className="w-10 h-10 text-[#D1D6DB] mb-3" />
             <p className="text-[#8B95A1] text-[14px]">
               아직 개설한 경기가 없어요.<br />
               첫 경기를 만들어보세요!
             </p>
           </div>
        </div>

        {/* Stats Summary (Optional) */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-[#E5E8EB] rounded-xl p-4 flex flex-col items-center">
                <span className="text-[24px] font-bold text-[#191F28] mb-1">0</span>
                <span className="text-[13px] text-[#8B95A1]">진행 예정</span>
            </div>
             <div className="bg-white border border-[#E5E8EB] rounded-xl p-4 flex flex-col items-center">
                <span className="text-[24px] font-bold text-[#191F28] mb-1">0</span>
                <span className="text-[13px] text-[#8B95A1]">완료된 경기</span>
            </div>
        </div>
      </div>


    </div>
  );
}
