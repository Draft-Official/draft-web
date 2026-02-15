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
      <div className="fixed bottom-0 left-0 right-0 max-w-[760px] mx-auto pointer-events-none z-50 px-6 pb-6 flex justify-end">
        <button 
          onClick={handleClick}
          className="pointer-events-auto bg-[#FF6600] hover:bg-[#FF6600]/90 text-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center transition-transform active:scale-95"
        >
          <Plus className="w-8 h-8 font-bold" strokeWidth={3} />
        </button>
      </div>
      <LoginRequiredModal {...modalProps} />
    </>
  );
}
