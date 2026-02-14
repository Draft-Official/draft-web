'use client';

import {
  MapPin,
  Home,
  Clock,
  Users,
  Trophy,
  User,
  Users2,
} from 'lucide-react';
import { formatRegion, formatRegularSchedule } from '@/features/team/api/mapper';
import { GENDER_LABELS, type GenderValue } from '@/shared/config/match-constants';
import { SKILL_LEVEL_NAMES } from '@/shared/config/skill-constants';
import type { Team } from '@/features/team/model/types';

interface TeamHomeTabProps {
  team: Team;
  homeGymName: string | null;
  memberCount: number;
}

/**
 * 팀 홈 탭 - 팀 정보 대시보드
 */
export function TeamHomeTab({ team, homeGymName, memberCount }: TeamHomeTabProps) {
  // 지역 정보
  const regionText = formatRegion(team.regionDepth1, team.regionDepth2);

  // 정기운동 스케줄
  const scheduleText = formatRegularSchedule(
    team.regularDay,
    team.regularStartTime,
    team.regularEndTime
  );

  // 나이 범위 표시
  const ageRangeText = team.ageRange
    ? team.ageRange.max && team.ageRange.min !== team.ageRange.max
      ? `${team.ageRange.min}대~${team.ageRange.max}대`
      : `${team.ageRange.min}대`
    : null;

  // 레벨 (levelRange에서 표시)
  const levelText = team.levelRange
    ? team.levelRange.min === team.levelRange.max
      ? SKILL_LEVEL_NAMES[team.levelRange.min] || `레벨 ${team.levelRange.min}`
      : `${SKILL_LEVEL_NAMES[team.levelRange.min] || `레벨 ${team.levelRange.min}`} ~ ${SKILL_LEVEL_NAMES[team.levelRange.max] || `레벨 ${team.levelRange.max}`}`
    : null;

  // 성별 라벨
  const genderText = team.teamGender
    ? GENDER_LABELS[team.teamGender as GenderValue] || team.teamGender
    : null;

  const infoItems = [
    {
      icon: MapPin,
      label: '지역',
      value: regionText,
      valueColor: 'text-primary',
    },
    {
      icon: Home,
      label: '홈 구장',
      value: homeGymName,
      valueColor: 'text-primary',
    },
    {
      icon: Clock,
      label: '모임 시간',
      value: scheduleText,
      valueColor: 'text-slate-900',
    },
    {
      icon: Users2,
      label: '성별',
      value: genderText,
      valueColor: 'text-slate-900',
    },
    {
      icon: User,
      label: '나이',
      value: ageRangeText,
      valueColor: 'text-slate-900',
    },
    {
      icon: Users,
      label: '멤버',
      value: `${memberCount}명`,
      valueColor: 'text-slate-900',
    },
    {
      icon: Trophy,
      label: '레벨',
      value: levelText,
      valueColor: 'text-slate-900',
    },
  ];

  return (
    <div className="bg-white">
      {/* 팀 소개 */}
      {team.description && (
        <section className="px-5 py-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">팀 소개</h2>
          <p className="text-base text-slate-600 whitespace-pre-wrap">
            {team.description}
          </p>
        </section>
      )}

      {/* 팀 정보 섹션 */}
      <section className={`px-5 py-6 ${team.description ? 'border-t border-slate-100' : ''}`}>
        <h2 className="text-lg font-bold text-slate-900 mb-4">팀 정보</h2>

        <div className="space-y-4">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-500">
                <item.icon className="w-5 h-5" />
                <span className="text-base">{item.label}</span>
              </div>
              <span className={`text-base font-medium ${item.valueColor}`}>
                {item.value || '-'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 최근 전적 섹션 (Placeholder) */}
      <section className="px-5 py-6 border-t border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">최근 전적</h2>
        <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
          전적 정보가 없습니다
        </div>
      </section>
    </div>
  );
}
