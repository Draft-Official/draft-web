'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Calendar } from 'lucide-react';
import { Card } from '@/shared/ui/shadcn/card';
import { cn } from '@/shared/lib/utils';
import {
  REGULAR_DAY_LABELS,
  REGULAR_DAY_SHORT_LABELS,
  type TeamRoleValue,
  type RegularDayValue,
} from '@/shared/config/team-constants';

const ROLE_LABELS_EN: Record<TeamRoleValue, string> = {
  LEADER: 'Leader',
  MANAGER: 'Manager',
  MEMBER: 'Member',
};

interface TeamProfileCardProps {
  id: string;
  code: string;
  name: string;
  logoUrl: string | null;
  role: TeamRoleValue;
  regularDays: RegularDayValue[];
  regularTime: string | null;
  homeGymName: string | null;
  className?: string;
}

/**
 * 팀 프로필 카드 컴포넌트
 * - /team 페이지의 나의 팀 목록에서 사용
 * - /team/[code] 페이지에서도 재사용 가능
 */
export function TeamProfileCard({
  code,
  name,
  logoUrl,
  role,
  regularDays,
  regularTime,
  homeGymName,
  className,
}: TeamProfileCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/team/${code}`);
  };

  // 팀 로고: logoUrl이 있으면 사용, 없으면 첫 글자로 대체
  const logoChar = name.charAt(0);
  const logoColors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-draft-500',
    'bg-pink-500',
  ];
  const logoColorIndex = name.charCodeAt(0) % logoColors.length;
  const logoBgColor = logoColors[logoColorIndex];

  // 정기운동 정보 포맷
  const dayStr = regularDays.length > 0
    ? regularDays.length === 2
      ? regularDays.map((d) => REGULAR_DAY_SHORT_LABELS[d]).join(', ')
      : regularDays.map((d) => REGULAR_DAY_LABELS[d]).join(', ')
    : null;
  const scheduleText = dayStr && regularTime
    ? `${dayStr} ${regularTime}`
    : dayStr;

  return (
    <Card
      onClick={handleClick}
      className={cn(
        'w-[160px] min-w-[160px] p-4 cursor-pointer',
        'hover:shadow-md active:scale-[0.98] transition-all',
        'ring-slate-200 rounded-2xl gap-0',
        className
      )}
    >
      {/* 팀 로고 */}
      <div className="flex justify-center mb-1">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${name} 로고`}
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center',
              'text-white text-xl font-bold',
              logoBgColor
            )}
          >
            {logoChar}
          </div>
        )}
      </div>

      {/* 팀 이름 */}
      <h3 className="text-center font-bold text-slate-900 text-sm truncate mb-1">
        {name}
      </h3>

      {/* 역할 */}
      <p className="text-center text-xs text-blue-500 font-medium mb-1">
        {ROLE_LABELS_EN[role]}
      </p>

      {/* 구분선 + 정기운동 */}
      <div className="border-t border-slate-100 pt-3 space-y-1.5">
        <p className="text-[10px] text-slate-400 text-center">정기운동</p>

        {homeGymName && (
          <div className="flex items-center justify-center gap-1 text-xs text-slate-600">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{homeGymName}</span>
          </div>
        )}

        {scheduleText && (
          <div className="flex items-center justify-center gap-1 text-xs text-slate-600">
            <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span>{scheduleText}</span>
          </div>
        )}

        {!homeGymName && !scheduleText && (
          <p className="text-xs text-slate-400 text-center">미설정</p>
        )}
      </div>
    </Card>
  );
}
