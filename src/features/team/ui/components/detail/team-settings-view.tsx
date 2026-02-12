'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { useSafeBack } from '@/shared/lib/hooks';
import { useTeamByCode } from '@/features/team/api/core/queries';
import { useMyMembership, useTeamMembers } from '@/features/team/api/membership/queries';
import { useAuth } from '@/features/auth/model/auth-context';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { deleteTeam } from '@/features/team/api/core/api';
import { leaveTeam } from '@/features/team/api/membership/api';
import { teamKeys, teamMemberKeys } from '@/features/team/api/keys';
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
import { AccountEditDialog } from './account-edit-dialog';
import { DelegateLeaderDialog } from './delegate-leader-dialog';

interface TeamSettingsViewProps {
  code: string;
}

/**
 * 팀 설정 페이지 뷰
 * - Leader: 프로필 수정, 환불 계좌, 소유자 위임, 팀 삭제
 * - Member: 팀 탈퇴
 */
export function TeamSettingsView({ code }: TeamSettingsViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const handleBack = useSafeBack(`/team/${code}`);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showDelegateDialog, setShowDelegateDialog] = useState(false);

  // 팀 정보 조회
  const { data: team, isLoading: isLoadingTeam } = useTeamByCode(code);

  // 멤버십 조회
  const { data: membership, isLoading: isLoadingMembership } = useMyMembership(
    team?.id,
    user?.id
  );

  // 팀원 목록 (위임용)
  const { data: members = [] } = useTeamMembers(team?.id);

  // 역할 확인
  const isLeader = membership?.role === 'LEADER';
  const isMember = !!membership;

  // 팀 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!team?.id) throw new Error('팀 정보가 없습니다');
      const supabase = getSupabaseBrowserClient();
      await deleteTeam(supabase, team.id);
    },
    onSuccess: () => {
      toast.success('팀이 삭제되었습니다');
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.myTeams(user?.id || '') });
      router.replace('/team');
    },
    onError: (error: Error) => {
      toast.error(`삭제 실패: ${error.message}`);
    },
  });

  // 팀 탈퇴 mutation
  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!team?.id || !user?.id) throw new Error('정보가 없습니다');
      const supabase = getSupabaseBrowserClient();
      await leaveTeam(supabase, team.id, user.id);
    },
    onSuccess: () => {
      toast.success('팀에서 탈퇴했습니다');
      queryClient.invalidateQueries({ queryKey: teamMemberKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.myTeams(user?.id || '') });
      router.replace('/team');
    },
    onError: (error: Error) => {
      toast.error(`탈퇴 실패: ${error.message}`);
    },
  });

  // 팀 로고 기본값
  const logoChar = team?.name?.charAt(0) || '?';
  const logoColors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
  ];
  const logoColorIndex = (team?.name || '').charCodeAt(0) % logoColors.length;
  const logoBgColor = logoColors[logoColorIndex];

  // 로딩 중
  if (isLoadingTeam || isLoadingMembership) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // 팀/멤버십 없음
  if (!team || !isMember) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center px-4">
          <button
            onClick={handleBack}
            className="p-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
          <h2 className="text-xl font-bold text-slate-900 mb-2">접근 권한이 없습니다</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center gap-3 px-4">
        <button
          onClick={handleBack}
          className="p-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors -ml-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* 팀 로고 + 이름 */}
        <div className="flex items-center gap-2">
          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt={team.name}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center',
                'text-white text-sm font-bold',
                logoBgColor
              )}
            >
              {logoChar}
            </div>
          )}
          <span className="font-bold text-slate-900">{team.name}</span>
          <span className="text-slate-400">/</span>
          <span className="font-bold text-slate-900">설정</span>
        </div>
      </header>

      {/* 메뉴 리스트 */}
      <div className="divide-y divide-slate-100">
        {/* Leader 전용 메뉴 */}
        {isLeader && (
          <>
            {/* 프로필 수정 */}
            <MenuItem
              label="프로필 수정"
              onClick={() => router.push(`/team/${code}/settings/edit`)}
              showArrow
            />

            {/* 환불 계좌 */}
            <MenuItem
              label="환불 계좌"
              value={team.accountInfo?.bank ? `${team.accountInfo.bank} ${team.accountInfo.number || ''}` : '-'}
              action="수정"
              onAction={() => setShowAccountDialog(true)}
            />

            {/* 팀 소유자 위임 */}
            <MenuItem
              label="팀 소유자 위임"
              onClick={() => setShowDelegateDialog(true)}
            />

            {/* 구분선 */}
            <div className="h-2 bg-slate-50" />

            {/* 팀 삭제 */}
            <MenuItem
              label="팀 삭제하기"
              danger
              onClick={() => setShowDeleteDialog(true)}
            />
          </>
        )}

        {/* Member 전용 메뉴 */}
        {!isLeader && (
          <>
            {/* 팀 탈퇴 */}
            <MenuItem
              label="팀 탈퇴하기"
              danger
              onClick={() => setShowLeaveDialog(true)}
            />
          </>
        )}
      </div>

      {/* 팀 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>팀을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              팀을 삭제하면 모든 팀원과 경기 기록이 영구적으로 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 팀 탈퇴 확인 다이얼로그 */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>팀을 탈퇴하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              팀을 탈퇴하면 팀 채팅과 경기 일정에 접근할 수 없습니다.
              다시 가입하려면 팀장의 승인이 필요합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => leaveMutation.mutate()}
              className="bg-red-500 hover:bg-red-600"
              disabled={leaveMutation.isPending}
            >
              {leaveMutation.isPending ? '탈퇴 중...' : '탈퇴'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 환불 계좌 수정 다이얼로그 */}
      <AccountEditDialog
        open={showAccountDialog}
        onOpenChange={setShowAccountDialog}
        teamId={team.id}
        currentAccount={team.accountInfo}
      />

      {/* 팀 소유자 위임 다이얼로그 */}
      <DelegateLeaderDialog
        open={showDelegateDialog}
        onOpenChange={setShowDelegateDialog}
        teamId={team.id}
        currentLeaderId={user?.id || ''}
        members={members}
        onSuccess={() => router.push(`/team/${code}`)}
      />
    </div>
  );
}

// 메뉴 아이템 컴포넌트
interface MenuItemProps {
  label: string;
  value?: string;
  action?: string;
  onAction?: () => void;
  onClick?: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

function MenuItem({
  label,
  value,
  action,
  onAction,
  onClick,
  showArrow,
  danger,
}: MenuItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-between px-5 py-4',
        onClick && 'cursor-pointer hover:bg-slate-50 transition-colors'
      )}
    >
      <span className={cn('text-base font-medium', danger ? 'text-red-500' : 'text-slate-900')}>
        {label}
      </span>

      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-slate-400">{value}</span>}
        {action && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction?.();
            }}
            className="text-sm text-primary font-medium"
          >
            {action}
          </button>
        )}
        {showArrow && <ChevronRight className="w-5 h-5 text-slate-300" />}
      </div>
    </div>
  );
}
