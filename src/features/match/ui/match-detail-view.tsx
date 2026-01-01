'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Share2, MapPin, Clock, Info } from 'lucide-react';
import { useMatches } from '../../../entities/match/model/match-context';
import { Match } from '../model/mock-data';
import { PositionChip } from './position-chip';
import { getDayLabel } from '../lib/utils';
import { cn } from '@/shared/lib/utils';

interface MatchDetailViewProps {
    matchId: string; // Changed from match object to ID for context lookup
}

export function MatchDetailView({ matchId }: MatchDetailViewProps) {
    const router = useRouter();
    const { matches } = useMatches();
    
    // Find live data from context
    const match = matches.find(m => m.id === matchId);

    if (!match) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">매치를 찾을 수 없습니다.</p>
            </div>
        );
    } // Fallback handled

    return (
        <div className="bg-white min-h-screen pb-[100px] relative">
            {/* 1. Header (Sticky) */}
            <div className="sticky top-0 z-40 bg-white h-[52px] flex items-center justify-between px-4 border-b border-[#F2F4F6]">
                <button onClick={() => router.back()} className="p-1 -ml-1">
                    <ChevronLeft className="w-6 h-6 text-[#191F28]" />
                </button>
                <h1 className="text-[17px] font-bold text-[#191F28]">매치 상세</h1>
                <button className="p-1 -mr-1">
                    <Share2 className="w-6 h-6 text-[#191F28]" />
                </button>
            </div>

            {/* 2. Main Content */}
            <div className="p-5 flex flex-col gap-6">
                {/* Title Section */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-[4px] bg-slate-100 text-[#4B5563] text-[11px] font-bold">
                            게스트 모집
                        </span>
                        {match.isClosed && (
                             <span className="inline-flex items-center justify-center bg-[#F2F4F6] text-[#ADB5BD] text-[11px] font-bold px-1.5 py-[3px] rounded-[4px]">
                                마감
                            </span>
                        )}
                    </div>
                    <h2 className="text-[22px] font-bold text-[#191F28] leading-tight mb-4">
                        {match.title}
                    </h2>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-[#8B95A1]" />
                            <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-[#191F28]">
                                    {getDayLabel(match.dateISO)}
                                </span>
                                <span className="text-[13px] text-[#8B95A1]">
                                    {match.startTime} ~ {match.endTime}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-[#8B95A1]" />
                            <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-[#191F28]">
                                    {match.location}
                                </span>
                                <span className="text-[13px] text-[#8B95A1] underline">
                                    지도 보기
                                </span>
                            </div>
                        </div>

                         <div className="flex items-center gap-3">
                            <div className="w-5 flex justify-center text-[#8B95A1] font-bold text-lg">￦</div>
                            <span className="text-[15px] font-bold text-[#191F28]">
                                {match.price}원
                            </span>
                        </div>
                    </div>
                </div>

                <div className="h-[1px] bg-[#F2F4F6]" />

                {/* Position Section */}
                <div>
                    <h3 className="text-[16px] font-bold text-[#191F28] mb-3">모집 포지션</h3>
                    <div className="flex flex-wrap gap-2">
                        {match.positions.all && (
                             <PositionChip label="무관" status={match.positions.all.status} max={match.positions.all.max} />
                        )}
                        {match.positions.g && (
                             <PositionChip label="가드" status={match.positions.g.status} max={match.positions.g.max} />
                        )}
                        {match.positions.f && (
                             <PositionChip label="포워드" status={match.positions.f.status} max={match.positions.f.max} />
                        )}
                        {match.positions.c && (
                             <PositionChip label="센터" status={match.positions.c.status} max={match.positions.c.max} />
                        )}
                    </div>
                </div>

                <div className="h-[1px] bg-[#F2F4F6]" />

                {/* Info Section */}
                <div>
                     <h3 className="text-[16px] font-bold text-[#191F28] mb-3">매치 정보</h3>
                     <div className="bg-[#F9FAFB] rounded-xl p-4 text-[14px] text-[#4E5968] leading-relaxed whitespace-pre-line">
                        {`• 주차 가능 (무료 2시간)
                        • 샤워 시설 완비
                        • 실내 코트 (냉난방 가동)`}
                     </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-[#F2F4F6] p-4 pb-safe z-50">
                <button 
                    disabled={match.isClosed}
                    className={cn(
                        "w-full h-12 rounded-xl text-[16px] font-bold flex items-center justify-center transition-all active:scale-[0.98]",
                        match.isClosed 
                            ? "bg-[#E5E8EB] text-[#B0B8C1] cursor-not-allowed"
                            : "bg-[#FF6600] text-white hover:bg-[#FF6600]/90 shadow-md shadow-orange-100"
                    )}
                >
                    {match.isClosed ? '모집이 마감되었습니다' : '신청하기'}
                </button>
            </div>
        </div>
    );
}
