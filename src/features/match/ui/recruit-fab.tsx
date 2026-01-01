'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

export function RecruitFAB() {
  return (
    <Link 
      href="/match/create"
      className="fixed bottom-[80px] right-5 z-[50] flex items-center justify-center gap-1.5 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white shadow-lg rounded-full px-5 py-3 transition-transform active:scale-95"
    >
      <Plus className="w-5 h-5 font-bold" strokeWidth={3} />
      <span className="text-[15px] font-bold tracking-tight">게스트 모집하기</span>
    </Link>
  );
}
