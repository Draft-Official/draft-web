'use client';

import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useSafeBack } from '@/shared/lib/hooks';
import { useTeamByCode } from '@/features/team/api/team-info/queries';
import { usePendingMembers, useMyMembership } from '@/features/team/api/membership/queries';
import { useApproveJoinRequest, useRejectJoinRequest } from '@/features/team/api/membership/mutations';
import { useAuth } from '@/shared/session';
import { Button } from '@/shared/ui/shadcn/button';
import type { TeamMember } from '@/features/team/model/types';
import { Spinner } from '@/shared/ui/shadcn/spinner';

interface PendingMembersViewProps {
  code: string;
}

export function PendingMembersView({ code }: PendingMembersViewProps) {
  const { user } = useAuth();
  const handleBack = useSafeBack(`/team/${code}`);

  const { data: team, isLoading: isLoadingTeam } = useTeamByCode(code);
  const { data: membership } = useMyMembership(team?.id, user?.id);
  const { data: pendingMembers = [], isLoading } = usePendingMembers(team?.id);

  const approveMutation = useApproveJoinRequest(team?.id || '');
  const rejectMutation = useRejectJoinRequest(team?.id || '');

  const isLeaderOrManager = membership?.role === 'LEADER' || membership?.role === 'MANAGER';

  if (isLoadingTeam || isLoading) {
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
      <Header onBack={handleBack} title="가입 신청 관리" />

      {pendingMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
          <p className="text-slate-500">가입 신청이 없습니다</p>
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
  member: TeamMember;
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
}

function PendingMemberItem({ member, onApprove, onReject, isLoading }: PendingMemberItemProps) {
  const avatarChar = member.user?.nickname?.charAt(0) || '?';

  return (
      <div className="flex items-center gap-3 px-5 py-4">
      {member.user?.avatarUrl ? (
        <Image src={member.user.avatarUrl} alt="" width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
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
