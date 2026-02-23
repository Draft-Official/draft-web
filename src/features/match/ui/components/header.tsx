'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { useRequireAuth } from '@/shared/session';
import { LoginRequiredModal } from '@/features/auth';

interface HeaderProps {
  isHidden?: boolean;
  hasScrolled?: boolean;
  notificationSlot?: React.ReactNode;
}

export function Header({
  isHidden = false,
  hasScrolled = false,
  notificationSlot,
}: HeaderProps) {
  const router = useRouter();
  const { requireAuth, modalProps } = useRequireAuth({
    redirectTo: '/matches/create',
    description: '모집글을 작성하려면 로그인이 필요합니다.\n로그인 후 이용해 주세요.',
  });

  const handleCreateMatch = () => {
    if (requireAuth()) router.push('/matches/create');
  };

  return (
    <>
      <div
        className={cn(
          'bg-white sticky top-0 z-20 border-b border-slate-100 transition-transform duration-300',
          isHidden && 'transform -translate-y-full'
        )}
        style={hasScrolled ? { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' } : {}}
      >
        <div className="flex items-center justify-between px-(--dimension-spacing-x-global-gutter) h-(--dimension-x14) w-full bg-white">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            게스트 모집
          </h1>
          <div className="flex items-center gap-(--dimension-x3)">
            <button
              onClick={handleCreateMatch}
              className="lg:hidden px-(--dimension-x3) py-(--dimension-x1_5) bg-primary text-white text-xs font-bold rounded-full shadow-sm hover:bg-primary/90 active:scale-95 transition-all mr-(--dimension-x1)"
            >
              경기 개설하기
            </button>
            {notificationSlot}
          </div>
        </div>
      </div>
      <LoginRequiredModal {...modalProps} />
    </>
  );
}
