'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useSafeBack } from '@/shared/lib/hooks';
import { useTeamByCode } from '@/features/team/api/team-info/queries';
import { usePendingMembers, useMyMembership, useTeamMembers } from '@/features/team/api/membership/queries';
import { useApproveJoinRequest, useRejectJoinRequest, useRemoveMember } from '@/features/team/api/membership/mutations';
import { useAuth } from '@/shared/session';
import { Button } from '@/shared/ui/shadcn/button';
import { Badge } from '@/shared/ui/shadcn/badge';
import { toast } from '@/shared/ui/shadcn/sonner';
import type { TeamMemberListItemDTO } from '@/features/team/model/types';
import { TEAM_ROLE_LABELS, TEAM_ROLE_STYLES } from '@/shared/config/team-constants';
import { getPositionLabel } from '@/shared/config/match-constants';
import { cn } from '@/shared/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/shadcn/alert-dialog';
import { Spinner } from '@/shared/ui/shadcn/spinner';

interface PendingMembersViewProps {
  code: string;
}

export function PendingMembersView({ code }: PendingMembersViewProps) {
  const { user } = useAuth();
  const handleBack = useSafeBack(`/team/${code}`);
  const [selectedMember, setSelectedMember] = useState<TeamMemberListItemDTO | null>(null);

  const { data: team, isLoading: isLoadingTeam } = useTeamByCode(code);
  const { data: membership } = useMyMembership(team?.id, user?.id);
  const { data: members = [], isLoading: isLoadingMembers } = useTeamMembers(team?.id);
  const { data: pendingMembers = [], isLoading } = usePendingMembers(team?.id);

  const approveMutation = useApproveJoinRequest(team?.id || '');
  const rejectMutation = useRejectJoinRequest(team?.id || '');
  const removeMutation = useRemoveMember();

  const isLeaderOrManager = membership?.role === 'LEADER' || membership?.role === 'MANAGER';
  const canExpelMember = membership?.role === 'LEADER';

  const handleRemoveMember = () => {
    if (!team?.id || !selectedMember) return;

    removeMutation.mutate(
      {
        membershipId: selectedMember.id,
        teamId: team.id,
        userId: selectedMember.userId,
      },
      {
        onSuccess: () => {
          toast.success('멤버를 추방했습니다.');
          setSelectedMember(null);
        },
        onError: (error: Error) => {
          toast.error(`추방 실패: ${error.message}`);
        },
      }
    );
  };

  if (isLoadingTeam || isLoading || isLoadingMembers) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (!isLeaderOrManager) {
    return (
      <div className="min-h-screen bg-white">
        <Header onBack={handleBack} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
          <h2 className="text-xl font-bold text-slate-900 mb-2">접근 권한이 없습니다</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onBack={handleBack} title="멤버 관리" />

      <section className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-medium text-slate-500 mb-3">
          가입 신청 ({pendingMembers.length}명)
        </h2>

        {pendingMembers.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">가입 신청이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingMembers.map((member) => (
              <PendingMemberItem
                key={member.id}
                member={member}
                onApprove={() => approveMutation.mutate(member.id)}
                onReject={() => rejectMutation.mutate(member.id)}
                isLoading={approveMutation.isPending || rejectMutation.isPending}
              />
            ))}
          </div>
        )}
      </section>

      <section className="px-5 py-4">
        <h2 className="text-sm font-medium text-slate-500 mb-3">
          현재 멤버 ({members.length}명)
        </h2>

        {members.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">등록된 멤버가 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <ActiveMemberItem
                key={member.id}
                member={member}
                canExpel={canExpelMember && member.userId !== user?.id && member.role !== 'LEADER'}
                onExpel={() => setSelectedMember(member)}
                isLoading={removeMutation.isPending}
              />
            ))}
          </div>
        )}
      </section>

      <AlertDialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>멤버를 추방하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedMember?.user?.nickname || '해당 멤버'}님을 팀에서 추방합니다.
              추방 후 다시 가입하려면 팀 승인 절차가 필요합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1 h-12 rounded-xl font-bold" disabled={removeMutation.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleRemoveMember}
              className="flex-1 h-12 rounded-xl font-bold"
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? '추방 중...' : '추방'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Header({ onBack, title }: { onBack: () => void; title?: string }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center gap-3 px-4">
      <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-50 rounded-full">
        <ArrowLeft className="w-6 h-6" />
      </button>
      {title && <h1 className="text-lg font-bold text-slate-900">{title}</h1>}
    </header>
  );
}

interface PendingMemberItemProps {
  member: TeamMemberListItemDTO;
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
}

function PendingMemberItem({ member, onApprove, onReject, isLoading }: PendingMemberItemProps) {
  const avatarChar = member.user?.nickname?.charAt(0) || '?';

  return (
    <div className="flex items-center gap-3 py-4">
      {member.user?.avatarUrl ? (
        <Image
          src={member.user.avatarUrl}
          alt=""
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-muted-foreground font-bold">
          {avatarChar}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{member.user?.nickname || '알 수 없음'}</p>
        {member.user?.positions && member.user.positions.length > 0 && (
          <p className="text-sm text-slate-500">{member.user.positions.join(', ')}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={isLoading}
          className="text-muted-foreground"
        >
          거절
        </Button>
        <Button
          size="sm"
          onClick={onApprove}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          수락
        </Button>
      </div>
    </div>
  );
}

interface ActiveMemberItemProps {
  member: TeamMemberListItemDTO;
  canExpel: boolean;
  onExpel: () => void;
  isLoading: boolean;
}

function ActiveMemberItem({ member, canExpel, onExpel, isLoading }: ActiveMemberItemProps) {
  const avatarChar = member.user?.nickname?.charAt(0) || '?';
  const roleStyle = TEAM_ROLE_STYLES[member.role];
  const heightText = member.user?.height ? `${member.user.height}cm` : '-';
  const weightText = member.user?.weight ? `${member.user.weight}kg` : '-';
  const positionText = member.user?.positions?.length
    ? member.user.positions.map((position) => getPositionLabel(position, 'short')).join(', ')
    : '-';
  const profileSummary = `키 ${heightText} · 몸무게 ${weightText} · 포지션 ${positionText}`;

  return (
    <div className="flex items-center gap-3 py-4">
      {member.user?.avatarUrl ? (
        <Image
          src={member.user.avatarUrl}
          alt=""
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-muted-foreground font-bold">
          {avatarChar}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900 truncate">{member.user?.nickname || '알 수 없음'}</p>
          <Badge
            variant="outline"
            className={cn('text-xs font-medium border', roleStyle.color, roleStyle.bgColor)}
          >
            {TEAM_ROLE_LABELS[member.role]}
          </Badge>
        </div>
        <p className="text-sm text-slate-500">{profileSummary}</p>
      </div>

      {canExpel && (
        <Button
          size="sm"
          variant="outline"
          onClick={onExpel}
          disabled={isLoading}
          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          추방
        </Button>
      )}
    </div>
  );
}
