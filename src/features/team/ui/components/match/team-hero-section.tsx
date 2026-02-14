'use client';

import { toast } from 'sonner';
import type { TeamMatchDetailDTO } from '@/features/team/model/types';

interface TeamHeroSectionProps {
  match: TeamMatchDetailDTO;
  teamName: string;
}

export function TeamHeroSection({ match, teamName }: TeamHeroSectionProps) {
  // 날짜/시간 포맷팅
  const formatDateTime = () => {
    const startDate = new Date(match.startTime);
    const endDate = new Date(match.endTime);
    const month = startDate.getMonth() + 1;
    const date = startDate.getDate();
    const day = ['일', '월', '화', '수', '목', '금', '토'][startDate.getDay()];
    const startTime = startDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const endTime = endDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${month}월 ${date}일 (${day}) ${startTime} ~ ${endTime}`;
  };

  // 주소 복사 핸들러
  const handleCopyAddress = async () => {
    if (!match.gymAddress) return;
    try {
      await navigator.clipboard.writeText(match.gymAddress);
      toast.success('주소가 복사되었습니다.');
    } catch {
      toast.error('주소 복사에 실패했습니다.');
    }
  };

  // 카카오맵 열기 핸들러
  const handleOpenMap = () => {
    if (!match.gymAddress) return;
    // 주소 검색으로 카카오맵 열기
    const searchUrl = `https://map.kakao.com/link/search/${encodeURIComponent(match.gymAddress)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white px-5 pt-6 pb-6 relative">
      {/* 0. Main Title */}
      <h1 className="text-[26px] font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
        {teamName} 정기운동
      </h1>

      {/* Separator after title */}
      <hr className="border-slate-200 mb-5" />

      {/* Info Section - 날짜, 장소 */}
      <div className="space-y-4">
        {/* 1. 날짜 */}
        <div className="flex items-baseline gap-3">
          <span className="text-base font-normal text-slate-500 w-12 shrink-0">날짜</span>
          <span className="text-base font-medium text-slate-900">
            {formatDateTime()}
          </span>
        </div>

        {/* 2. 장소 */}
        {match.gymName && (
          <div className="flex items-start gap-3">
            <span className="text-base font-normal text-slate-500 w-12 shrink-0 pt-0.5">장소</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-medium text-slate-900">
                  {match.gymName}
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
                <span className="text-slate-500">{match.gymAddress || '-'}</span>
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
        )}
      </div>
    </div>
  );
}
