'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/shadcn/popover';
import type { TeamRoleValue } from '@/shared/config/team-constants';

interface TeamFabProps {
  teamCode: string;
  role: TeamRoleValue;
}

/**
 * 팀 상세 페이지 플로팅 액션 버튼
 * - 경기 생성하기
 * - 링크로 멤버 초대하기
 */
export function TeamFab({ teamCode, role }: TeamFabProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Leader/Manager만 경기 생성 가능
  const canCreateMatch = role === 'LEADER' || role === 'MANAGER';

  const handleCreateMatch = () => {
    setOpen(false);
    router.push(`/team/${teamCode}/match/create`);
  };

  const handleInviteMember = async () => {
    setOpen(false);
    const inviteUrl = `${window.location.origin}/team/${teamCode}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('초대 링크가 복사되었습니다');
    } catch {
      toast.error('링크 복사에 실패했습니다');
    }
  };

  // 역할에 따라 메뉴 아이템 필터링
  const menuItems = [
    // 경기 생성은 Leader/Manager만
    ...(canCreateMatch
      ? [
          {
            icon: Calendar,
            label: '경기 생성하기',
            onClick: handleCreateMatch,
          },
        ]
      : []),
    {
      icon: Link2,
      label: '링크로 멤버 초대하기',
      onClick: handleInviteMember,
    },
  ];

  return (
    <div className="fixed bottom-24 right-4 z-50 max-w-[var(--layout-mobile-max)]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'w-14 h-14 rounded-full bg-primary text-white shadow-lg',
              'flex items-center justify-center',
              'hover:bg-primary/90 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              open && 'rotate-45'
            )}
          >
            <Plus className="w-7 h-7" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          className="w-52 p-2"
        >
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                  'text-sm font-medium text-slate-700',
                  'hover:bg-slate-100 transition-colors'
                )}
              >
                <item.icon className="w-5 h-5 text-slate-500" />
                {item.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
