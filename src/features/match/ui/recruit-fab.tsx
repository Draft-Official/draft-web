import Link from 'next/link';
import { Plus } from 'lucide-react';

export function RecruitFAB() {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[760px] mx-auto pointer-events-none z-50 px-6 pb-6 flex justify-end">
      <Link 
        href="/match/create"
        className="pointer-events-auto bg-[#FF6600] hover:bg-[#FF6600]/90 text-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center transition-transform active:scale-95"
      >
        <Plus className="w-8 h-8 font-bold" strokeWidth={3} />
      </Link>
    </div>
  );
}
