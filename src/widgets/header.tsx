'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  /* Navigation Formula Implementation:
     Case 1 (Main): Show Logo (handled here)
     Case 2 (Detail) & 3 (Modal): Handled by page-specific headers (hide global header)
  */
  const MAIN_PATHS = ['/', '/team', '/schedule', '/my'];
  const isMainPage = MAIN_PATHS.includes(pathname);

  if (!isMainPage) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 h-14 flex items-center justify-center px-5 relative">
       {/* Centered or Left Logo? User said '대신 로고나 페이지 제목을 넣습니다'. 
           Original was left-aligned with space-between. 
           If it's JUST logo, left align is fine, or center. 
           Mobile apps often have logo left or center. 
           Let's keep it Left aligned but remove the justify-between if no right element.
           Actually, 'justify-center' with absolute left might be better if we want center title later, 
           but for Logo DRAFT. it was Left. I will keep it Left.
       */}
       <div className="w-full flex items-center justify-start">
         <Link href="/" className="font-extrabold text-2xl italic tracking-tighter text-slate-900">
          DRAFT.
         </Link>
       </div>
    </header>
  );
}
