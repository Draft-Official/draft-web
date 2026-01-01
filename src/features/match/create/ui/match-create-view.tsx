'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar as CalendarIcon, MapPin, DollarSign, Users } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { RegionFilterModal } from '@/features/match/ui/region-filter-modal';
import { useMatches } from '../../../../entities/match/model/match-context'; // Relative path for safety
import { getDistrictName } from '@/features/match/model/mock-data';
import { getDayLabel } from '../../lib/utils';

export function MatchCreateView() {
  const router = useRouter();
  const { addMatch } = useMatches();
  
  // --- Form State ---
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState<string>('');
  const [price, setPrice] = useState('');
  
  // --- UI State ---
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);

  // --- Handlers ---
  const handleRegionApply = (regions: string[]) => {
      // For match creation, we usually select ONE location
      if (regions.length > 0) {
          setLocation(regions[0]);
      }
  };

  const isFormValid = title && date && startTime && endTime && location && price;

  const handleCreate = () => {
    if (!isFormValid) return;

    const newMatch: any = { 
        id: Date.now().toString(),
        title,
        dateISO: date,
        startTime,
        endTime,
        location: getDistrictName(location), // "강남구"
        address: location, // "서울 강남구..."
        price,
        isClosed: false,
        positions: {
            all: { status: 'open', max: 99 }
        }
    };

    addMatch(newMatch);
    // After creating, go to Host Dashboard
    router.push('/host/dashboard'); 
  };

  return (
    <div className="bg-white min-h-screen pb-[100px] relative">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white h-[52px] flex items-center px-4 border-b border-[#F2F4F6] gap-3">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ChevronLeft className="w-6 h-6 text-[#191F28]" />
        </button>
        <h1 className="text-[17px] font-bold text-[#191F28]">매치 개설하기</h1>
      </div>

      <div className="p-5 flex flex-col gap-8">
        {/* 1. Title */}
        <div className="flex flex-col gap-2">
            <label className="text-[15px] font-bold text-[#191F28]">제목</label>
            <input 
                type="text"
                placeholder="어떤 경기인가요? (예: 3vs3 반코트)"
                className="w-full h-12 px-4 rounded-xl border border-[#E5E8EB] bg-[#F9FAFB] text-[15px] outline-none focus:border-[#FF6600] transition-colors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
        </div>

        {/* 2. Date & Time */}
        <div className="flex flex-col gap-2">
            <label className="text-[15px] font-bold text-[#191F28]">일시</label>
            <div className="grid grid-cols-2 gap-3">
                <input 
                    type="date"
                    className="h-12 px-4 rounded-xl border border-[#E5E8EB] bg-[#F9FAFB] text-[15px] outline-none focus:border-[#FF6600]"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <div className="flex items-center gap-2">
                    <input 
                        type="time" 
                        className="flex-1 h-12 px-2 rounded-xl border border-[#E5E8EB] bg-[#F9FAFB] text-[15px] outline-none focus:border-[#FF6600]"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                    <span className="text-[#8B95A1] font-medium">~</span>
                    <input 
                        type="time"
                        className="flex-1 h-12 px-2 rounded-xl border border-[#E5E8EB] bg-[#F9FAFB] text-[15px] outline-none focus:border-[#FF6600]"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* 3. Location */}
        <div className="flex flex-col gap-2">
            <label className="text-[15px] font-bold text-[#191F28]">장소</label>
            <button 
                onClick={() => setIsRegionModalOpen(true)}
                className={cn(
                    "w-full h-12 px-4 rounded-xl border flex items-center justify-between transition-colors",
                    location 
                        ? "border-[#FF6600] bg-white text-[#191F28]" 
                        : "border-[#E5E8EB] bg-[#F9FAFB] text-[#ADB5BD]"
                )}
            >
                <span className="text-[15px]">{location || "지역을 선택해주세요"}</span>
                <MapPin className={cn("w-5 h-5", location ? "text-[#FF6600]" : "text-[#ADB5BD]")} />
            </button>
        </div>

        {/* 4. Price */}
        <div className="flex flex-col gap-2">
            <label className="text-[15px] font-bold text-[#191F28]">참가비</label>
            <div className="relative">
                <input 
                    type="number"
                    placeholder="10000"
                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-[#E5E8EB] bg-[#F9FAFB] text-[15px] outline-none focus:border-[#FF6600] transition-colors"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B95A1] font-medium">원</span>
            </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-[#F2F4F6] p-4 pb-safe z-30">
        <button 
            disabled={!isFormValid}
            onClick={handleCreate} // Updated handler
            className={cn(
                "w-full h-12 rounded-xl text-[16px] font-bold flex items-center justify-center transition-all active:scale-[0.98]",
                isFormValid 
                    ? "bg-[#FF6600] text-white hover:bg-[#FF6600]/90 shadow-md shadow-orange-100"
                    : "bg-[#E5E8EB] text-[#B0B8C1] cursor-not-allowed"
            )}
        >
            개설하기
        </button>
      </div>

      {/* Region Modal Reuse */}
      <RegionFilterModal 
        open={isRegionModalOpen}
        onOpenChange={setIsRegionModalOpen}
        onApply={handleRegionApply}
        selectedRegions={location ? [location] : []}
      />
    </div>
  );
}
