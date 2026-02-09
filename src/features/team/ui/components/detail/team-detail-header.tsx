'use client';

import { useRouter } from 'next/navigation';
import { MapPin, Clock, Settings } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';
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
 * - 운동 생성 / 팀 설정 버튼 (역할 기반)
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
  const isLeaderOrManager = membership?.role === 'LEADER' || membership?.role === 'MANAGER';

  const handleCreateMatch = () => {
    router.push(`/team/${team.code}/match/create`);
  };

  const handleSettings = () => {
    router.push(`/team/${team.code}/settings`);
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

      {/* 액션 버튼 */}
      {isMember && (
        <div className="flex gap-3">
          {/* 운동 생성 버튼 - 팀원 이상 */}
          <Button
            onClick={handleCreateMatch}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold h-11"
          >
            이번 주 운동 생성
          </Button>

          {/* 팀 설정 버튼 */}
          <Button
            variant="outline"
            onClick={handleSettings}
            className="w-11 h-11 p-0 border-slate-200"
          >
            <Settings className="w-5 h-5 text-slate-600" />
          </Button>
        </div>
      )}
    </div>
  );
}
