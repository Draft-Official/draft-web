'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Plus, Users } from 'lucide-react';
import { TEAM_ROLE_LABELS } from '@/shared/config/team-constants';
import { LoginRequiredModal } from '@/features/auth';
import { useMyTeams } from '@/features/team/api/team-info/queries';
import { useAuth } from '@/shared/session';
import { cn } from '@/shared/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';

interface CreateMenuButtonProps {
  className?: string;
}

export function CreateMenuButton({ className }: CreateMenuButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: myTeams } = useMyTeams(user?.id);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTeamSelectModalOpen, setIsTeamSelectModalOpen] = useState(false);
  const [loginRedirectPath, setLoginRedirectPath] = useState('/');

  const manageableTeams = (myTeams ?? []).filter(
    (team) => (team.role === 'LEADER' || team.role === 'MANAGER') && team.code
  );

  const requireAuth = (redirectPath: string) => {
    if (isAuthLoading) return false;
    if (!isAuthenticated) {
      setLoginRedirectPath(redirectPath);
      setIsLoginModalOpen(true);
      return false;
    }
    return true;
  };

  const navigateIfAllowed = (path: string) => {
    setIsOpen(false);
    if (!requireAuth(path)) return;
    router.push(path);
  };

  const handleGuestMatchCreate = () => {
    navigateIfAllowed('/matches/create');
  };

  const handleTeamCreate = () => {
    navigateIfAllowed('/team/create');
  };

  const handleTeamRegularMatchCreate = () => {
    setIsOpen(false);
    if (!requireAuth('/team')) return;

    if (manageableTeams.length === 0) {
      router.push('/team');
      return;
    }

    if (manageableTeams.length === 1) {
      router.push(`/team/${manageableTeams[0].code}/match/create`);
      return;
    }

    setIsTeamSelectModalOpen(true);
  };

  const handleTeamSelect = (teamCode: string) => {
    setIsTeamSelectModalOpen(false);
    router.push(`/team/${teamCode}/match/create`);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="만들기 메뉴 열기"
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-white transition-colors hover:bg-primary/90',
              'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2',
              className
            )}
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
            <span className="text-base font-semibold leading-none">만들기</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-64 rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 shadow-2xl"
        >
          <DropdownMenuItem
            onClick={handleGuestMatchCreate}
            className="h-12 gap-3 rounded-xl bg-white px-3 text-base text-slate-900 focus:bg-slate-100 focus:text-slate-900"
          >
            <Calendar className="h-5 w-5 text-slate-500" />
            게스트 경기 개설
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleTeamCreate}
            className="h-12 gap-3 rounded-xl bg-white px-3 text-base text-slate-900 focus:bg-slate-100 focus:text-slate-900"
          >
            <Users className="h-5 w-5 text-slate-500" />
            팀 생성
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleTeamRegularMatchCreate}
            className="h-12 gap-3 rounded-xl bg-white px-3 text-base text-slate-900 focus:bg-slate-100 focus:text-slate-900"
          >
            <Clock className="h-5 w-5 text-slate-500" />
            팀 정기운동 생성
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LoginRequiredModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
        redirectTo={loginRedirectPath}
        description={'생성 기능을 사용하려면 로그인이 필요합니다.\n로그인 후 이용해 주세요.'}
      />

      <Dialog open={isTeamSelectModalOpen} onOpenChange={setIsTeamSelectModalOpen}>
        <DialogContent size="sm" className="rounded-2xl">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-lg font-bold text-slate-900">
              팀 선택
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              정기운동을 생성할 팀을 선택해 주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-1 space-y-2">
            {manageableTeams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => handleTeamSelect(team.code)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition-colors hover:bg-slate-50"
              >
                <span className="text-sm font-semibold text-slate-900">{team.name}</span>
                <span className="text-xs font-medium text-slate-500">
                  {TEAM_ROLE_LABELS[team.role]}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
