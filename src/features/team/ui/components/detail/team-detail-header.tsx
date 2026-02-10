'use client';

import { useRouter } from 'next/navigation';
import { MapPin, Clock, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { formatRegularSchedule } from '@/features/team/api/mapper';
import type { ClientTeam, ClientTeamMember } from '@/features/team/model/types';

interface TeamDetailHeaderProps {
  team: ClientTeam;
  membership: ClientTeamMember | null;
  homeGymName: string | null;
}

/**
 * 팀 상세 페이지 헤더 섹션
 * - 팀 로고, 이름, 기본 정보
 * - 팀 설정 / 공유 버튼 (세그먼트 컨트롤 스타일)
 */
export function TeamDetailHeader({ team, membership, homeGymName }: TeamDetailHeaderProps) {
  const router = useRouter();

  // 팀 로고 기본값
  const logoChar = team.name.charAt(0);
  const logoColors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
  ];
  const logoColorIndex = team.name.charCodeAt(0) % logoColors.length;
  const logoBgColor = logoColors[logoColorIndex];

  // 정기운동 스케줄 포맷
  const scheduleText = formatRegularSchedule(
    team.regularDay,
    team.regularStartTime,
    team.regularEndTime
  );

  // 역할 기반 버튼 노출
  const isMember = !!membership;

  const handleSettings = () => {
    router.push(`/team/${team.code}/settings`);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/team/${team.code}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('팀 링크가 복사되었습니다');
    } catch {
      toast.error('링크 복사에 실패했습니다');
    }
  };

  return (
    <div className="px-5 py-6 bg-white">
      {/* 팀 로고 + 이름 */}
      <div className="flex items-start gap-4 mb-4">
        {/* 로고 */}
        <div className="shrink-0">
          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt={`${team.name} 로고`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                'text-white text-2xl font-bold',
                logoBgColor
              )}
            >
              {logoChar}
            </div>
          )}
        </div>

        {/* 팀 정보 */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 truncate">{team.name}</h1>

          {/* 홈 구장 */}
          {homeGymName && (
            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-primary">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{homeGymName}</span>
            </div>
          )}

          {/* 정기 운동 */}
          {scheduleText && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
              <Clock className="w-4 h-4 shrink-0" />
              <span>{scheduleText}</span>
            </div>
          )}
        </div>
      </div>

      {/* 세그먼트 컨트롤 스타일 버튼 (팀 설정 / 공유) */}
      {isMember && (
        <div className="flex rounded-xl bg-slate-100 p-1">
          {/* 팀 설정 버튼 */}
          <button
            onClick={handleSettings}
            className="flex-1 py-2.5 px-4 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors rounded-lg"
          >
            팀 설정
          </button>

          {/* 구분선 */}
          <div className="w-px bg-slate-200 my-2" />

          {/* 공유 버튼 (...) */}
          <button
            onClick={handleShare}
            className="px-4 py-2.5 text-slate-500 hover:text-slate-700 transition-colors rounded-lg"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
