'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useRequireAuth } from '@/shared/session';
import { LoginRequiredModal } from '@/features/auth';

export function RecruitFAB() {
  const router = useRouter();
  const { requireAuth, modalProps } = useRequireAuth({
    redirectTo: '/matches/create',
    description: '모집글을 작성하려면 로그인이 필요합니다.\n로그인 후 이용해 주세요.',
  });

  const handleClick = () => {
    // requireAuth()가 true를 반환하면 로그인된 상태
    if (requireAuth()) {
      router.push('/matches/create');
    }
    // false를 반환하면 모달이 자동으로 표시됨
  };

  return (
    <>
      <div className="app-overlay-shell app-overlay-shell--with-sidebar">
        <div className="app-overlay-content px-6 pb-6 flex justify-end">
          <button
            onClick={handleClick}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center transition-transform active:scale-95"
          >
            <Plus className="w-8 h-8 font-bold" strokeWidth={3} />
          </button>
        </div>
      </div>
      <LoginRequiredModal {...modalProps} />
    </>
  );
}
