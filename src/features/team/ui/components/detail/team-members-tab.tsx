'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, UserPlus } from 'lucide-react';
import { Badge } from '@/shared/ui/base/badge';
import { cn } from '@/shared/lib/utils';
import {
  TEAM_ROLE_LABELS,
  TEAM_ROLE_STYLES,
  type TeamRoleValue,
} from '@/shared/config/team-constants';
import type { ClientTeamMember } from '@/features/team/model/types';

interface TeamMembersTabProps {
  teamCode: string;
  members: ClientTeamMember[];
  pendingCount: number;
  myRole: TeamRoleValue | null;
  isLoading?: boolean;
}

/**
 * 팀 멤버 탭 - 멤버 리스트 + 관리자용 가입 신청 관리
 */
export function TeamMembersTab({
  teamCode,
  members,
  pendingCount,
  myRole,
  isLoading,
}: TeamMembersTabProps) {
  const router = useRouter();

  // 관리자 여부 (Leader, Manager만)
  const isAdmin = myRole === 'LEADER' || myRole === 'MANAGER';

  const handleJoinRequestsClick = () => {
    router.push(`/team/${teamCode}/manage/requests`);
  };

  if (isLoading) {
    return (
      <div className="px-5 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* 가입 신청 관리 배너 - 관리자만 */}
      {isAdmin && (
        <div
          onClick={handleJoinRequestsClick}
          className="mx-5 mt-4 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">가입 신청 내역</p>
                {pendingCount > 0 && (
                  <p className="text-sm text-primary">{pendingCount}명의 신청이 있습니다</p>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      )}

      {/* 멤버 리스트 */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-medium text-slate-500 mb-3">
          멤버 ({members.length}명)
        </h3>

        <div className="space-y-0 divide-y divide-slate-100">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
}

// 멤버 행 컴포넌트
interface MemberRowProps {
  member: ClientTeamMember;
}

function MemberRow({ member }: MemberRowProps) {
  // 아바타 기본값
  const avatarChar = member.user?.nickname?.charAt(0) || '?';
  const avatarColors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
  ];
  const avatarColorIndex = (member.user?.nickname || '').charCodeAt(0) % avatarColors.length;
  const avatarBgColor = avatarColors[avatarColorIndex];

  const roleStyle = TEAM_ROLE_STYLES[member.role];

  return (
    <div className="flex items-center gap-3 py-3">
      {/* 아바타 */}
      {member.user?.avatarUrl ? (
        <img
          src={member.user.avatarUrl}
          alt={member.user.nickname || '멤버'}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            'text-white text-sm font-bold',
            avatarBgColor
          )}
        >
          {avatarChar}
        </div>
      )}

      {/* 이름 + 역할 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 truncate">
            {member.user?.nickname || '알 수 없음'}
          </span>
          <Badge
            variant="outline"
            className={cn(
              'text-xs font-medium border',
              roleStyle.color,
              roleStyle.bgColor
            )}
          >
            {TEAM_ROLE_LABELS[member.role]}
          </Badge>
        </div>
      </div>
    </div>
  );
}
