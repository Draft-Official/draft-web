'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, User } from 'lucide-react';
import { Badge } from '@/shared/ui/shadcn/badge';
import { cn } from '@/shared/lib/utils';
import {
  TEAM_ROLE_LABELS,
  TEAM_ROLE_STYLES,
  type TeamRoleValue,
} from '@/shared/config/team-constants';
import type { TeamMember } from '@/features/team/model/types';
import { Spinner } from '@/shared/ui/shadcn/spinner';

interface TeamMembersTabProps {
  teamCode: string;
  members: TeamMember[];
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
    router.push(`/team/${teamCode}/members/pending`);
  };

  if (isLoading) {
    return (
      <div className="px-5 py-8 flex items-center justify-center">
        <Spinner className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* 멤버 리스트 */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-500">
            멤버 ({members.length}명)
          </h3>

          {/* 멤버 관리하기 링크 - 관리자만 */}
          {isAdmin && (
            <button
              onClick={handleJoinRequestsClick}
              className="flex items-center gap-1 px-3 py-1.5 -mr-3 rounded-lg text-sm text-muted-foreground hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <span>멤버 관리하기</span>
              {pendingCount > 0 && (
                <span className="text-muted-foreground font-medium">({pendingCount})</span>
              )}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

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
  member: TeamMember;
}

function MemberRow({ member }: MemberRowProps) {
  const roleStyle = TEAM_ROLE_STYLES[member.role];

  return (
    <div className="flex items-center gap-3 py-3">
      {/* 아바타 */}
      {member.user?.avatarUrl ? (
        <Image
          src={member.user.avatarUrl}
          alt={member.user.nickname || '멤버'}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
          <User className="w-5 h-5 text-slate-500" />
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
