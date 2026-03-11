'use client';

import { useState, type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Plus } from 'lucide-react';
import { TEAM_ROLE_LABELS } from '@/shared/config/team-constants';
import { LoginRequiredModal } from '@/features/auth';
import { CREATE_ACTION_OPTIONS, type CreateActionOptionId } from '@/features/create/lib/create-action-options';
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/shared/ui/shadcn/hover-card';

interface CreateMenuButtonProps {
  className?: string;
  compact?: boolean;
  variant?: 'pill' | 'sidebar';
  hoverDescription?: string;
}

export function CreateMenuButton({
  className,
  compact = false,
  variant = 'pill',
  hoverDescription,
}: CreateMenuButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTeamSelectModalOpen, setIsTeamSelectModalOpen] = useState(false);
  const [isResolvingTeamCreate, setIsResolvingTeamCreate] = useState(false);
  const [loginRedirectPath, setLoginRedirectPath] = useState('/');

  const shouldLoadTeams = isAuthenticated && isCreateDialogOpen;
  const { data: myTeams, refetch: refetchMyTeams } = useMyTeams(user?.id, {
    enabled: shouldLoadTeams,
  });

  if (!isAuthLoading && !isAuthenticated) return null;

  const filterManageableTeams = (teams: typeof myTeams) => (teams ?? []).filter(
    (team) => (team.role === 'LEADER' || team.role === 'MANAGER') && team.code
  );
  const manageableTeams = filterManageableTeams(myTeams);

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
    setIsCreateDialogOpen(false);
    if (!requireAuth(path)) return;
    router.push(path);
  };

  const handleGuestMatchCreate = () => {
    navigateIfAllowed('/matches/create');
  };

  const handleTeamRegularMatchCreate = async () => {
    setIsCreateDialogOpen(false);
    if (!requireAuth('/team')) return;

    setIsResolvingTeamCreate(true);

    try {
      const teams = myTeams ?? (await refetchMyTeams()).data;
      const nextManageableTeams = filterManageableTeams(teams);

      if (nextManageableTeams.length === 0) {
        router.push('/team');
        return;
      }

      if (nextManageableTeams.length === 1) {
        router.push(`/team/${nextManageableTeams[0].code}/match/create`);
        return;
      }

      setIsTeamSelectModalOpen(true);
    } finally {
      setIsResolvingTeamCreate(false);
    }
  };

  const handleTeamSelect = (teamCode: string) => {
    setIsTeamSelectModalOpen(false);
    router.push(`/team/${teamCode}/match/create`);
  };

  const ACTION_ICON_MAP: Record<CreateActionOptionId, ComponentType<{ className?: string }>> = {
    'guest-match': Calendar,
    'team-regular': Clock,
  };

  const handleCreateActionSelect = (actionId: CreateActionOptionId) => {
    if (actionId === 'guest-match') {
      handleGuestMatchCreate();
      return;
    }

    void handleTeamRegularMatchCreate();
  };

  const shouldShowHoverDescription = Boolean(hoverDescription && compact && variant === 'pill');

  const createButton = (
    <button
      type="button"
      aria-label="만들기 메뉴 열기"
      onClick={() => setIsCreateDialogOpen(true)}
      className={cn(
        variant === 'pill' &&
          'inline-flex h-10 items-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90',
        variant === 'pill' && (compact ? 'w-10 justify-center p-0' : 'gap-2 px-4'),
        variant === 'sidebar' &&
          'flex w-full rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900',
        variant === 'sidebar' &&
          (compact
            ? 'items-center justify-center px-2 py-3'
            : 'items-center gap-4 px-4 py-3 text-lg font-medium'),
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2',
        className
      )}
    >
      <Plus
        className={cn(
          variant === 'sidebar'
            ? (compact ? 'h-6 w-6' : 'h-7 w-7')
            : (compact ? 'h-6 w-6' : 'h-5 w-5')
        )}
        strokeWidth={2.5}
      />
      {compact ? (
        <span className="sr-only">만들기</span>
      ) : (
        <span
          className={cn(
            variant === 'sidebar'
              ? 'text-lg font-medium leading-none'
              : 'text-base font-semibold leading-none'
          )}
        >
          만들기
        </span>
      )}
    </button>
  );

  return (
    <>
      {shouldShowHoverDescription ? (
        <HoverCard openDelay={150}>
          <HoverCardTrigger asChild>{createButton}</HoverCardTrigger>
          <HoverCardContent side="bottom" align="end" className="w-auto px-3 py-1.5">
            <p className="text-sm">{hoverDescription}</p>
          </HoverCardContent>
        </HoverCard>
      ) : (
        createButton
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent size="sm" className="rounded-2xl">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-lg font-bold text-slate-900">만들기</DialogTitle>
            <DialogDescription className="text-slate-500">
              아래 항목 중 하나를 선택해 주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-1 space-y-2">
            {CREATE_ACTION_OPTIONS.map((option) => {
              const Icon = ACTION_ICON_MAP[option.id];
              const isTeamRegular = option.id === 'team-regular';
              const label =
                isTeamRegular && isResolvingTeamCreate ? '팀 목록 확인 중...' : option.label;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleCreateActionSelect(option.id)}
                  disabled={isTeamRegular && isResolvingTeamCreate}
                  className="flex h-12 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 text-left text-base text-slate-900 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Icon className="h-5 w-5 text-slate-500" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

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
