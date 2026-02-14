'use client';

import React from 'react';
import { toast } from 'sonner';
import { GuestMatchDetailDTO } from '@/features/match/model/types';

interface HeroSectionProps {
  match: GuestMatchDetailDTO;
}

export function HeroSection({ match }: HeroSectionProps) {
  // 주소 복사 핸들러
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(match.address);
      toast.success('주소가 복사되었습니다.');
    } catch {
      toast.error('주소 복사에 실패했습니다.');
    }
  };

  // 카카오맵 열기 핸들러
  const handleOpenMap = () => {
    if (match.latitude && match.longitude) {
      // 길찾기 URL (현재 위치 → 목적지)
      const mapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(match.location)},${match.latitude},${match.longitude}`;
      window.open(mapUrl, '_blank', 'noopener,noreferrer');
    } else {
      // 좌표가 없으면 주소 검색으로 fallback
      const searchUrl = `https://map.kakao.com/link/search/${encodeURIComponent(match.address)}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white px-5 pt-6 pb-6 relative">

      {/* 0. Main Title (Team Name) */}
      <h1 className="text-[26px] font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
        {match.teamName}에서 게스트 모집합니다!
      </h1>

      {/* Separator after title */}
      <hr className="border-slate-200 mb-5" />

      {/* Info Section - 날짜, 장소, 참가비 */}
      <div className="space-y-4">

        {/* 1. 날짜 */}
        <div className="flex items-baseline gap-3">
          <span className="text-base font-normal text-slate-500 w-12 shrink-0">날짜</span>
          <span className="text-base font-medium text-slate-900">
            {(() => {
              const d = new Date(match.dateISO);
              const month = d.getMonth() + 1;
              const date = d.getDate();
              const day = ['일','월','화','수','목','금','토'][d.getDay()];
              return `${month}월 ${date}일 (${day}) ${match.startTime} ~ ${match.endTime}`;
            })()}
          </span>
        </div>

        {/* 2. 장소 */}
        <div className="flex items-start gap-3">
          <span className="text-base font-normal text-slate-500 w-12 shrink-0 pt-0.5">장소</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-medium text-slate-900">
                {match.location}
              </span>
              <button
                onClick={() => {
                  document.getElementById('facility-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[11px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors"
              >
                편의시설 정보
              </button>
            </div>
            <div className="flex items-center flex-wrap gap-x-2 text-[13px]">
              <span className="text-slate-500">{match.address}</span>
              <span className="text-slate-300">|</span>
              <button
                onClick={handleCopyAddress}
                className="text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-2"
              >
                주소복사
              </button>
              <button
                onClick={handleOpenMap}
                className="text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-2"
              >
                지도보기
              </button>
            </div>
          </div>
        </div>

        {/* 3. 참가비 */}
        <div className="flex items-center gap-3">
          <span className="text-base font-normal text-slate-500 w-12 shrink-0">참가비</span>
          <div className="relative">
            {/* Speech Bubble Badge - 음료 제공 시에만 표시 */}
            {Boolean(match.facilities?.providesBeverage) && (
              <div className="absolute -top-6 left-0 px-2 py-0.5 bg-[#FF6600] rounded-full shadow-sm whitespace-nowrap z-10">
                <span className="text-[10px] font-bold text-white tracking-wide block">
                  물/음료 제공
                </span>
                {/* Tail */}
                <div className="absolute left-3 bottom-[-3px] w-1.5 h-1.5 bg-[#FF6600] rotate-45"></div>
              </div>
            )}

            {/* Price Text */}
            <div className="flex items-baseline">
              <span className="text-base font-medium text-slate-900">
                {match.price}
              </span>
              <span className="text-xs text-slate-400 ml-1.5">/ 2시간</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
