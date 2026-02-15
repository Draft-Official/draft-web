'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface HeaderProps {
  rightSlot?: ReactNode;
}

export function Header({ rightSlot }: HeaderProps) {
  const pathname = usePathname() ?? '';
  const MAIN_PATHS = ['/', '/team', '/schedule', '/my'];
  const isMainPage = MAIN_PATHS.includes(pathname);

  if (!isMainPage) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 h-14 flex items-center justify-center px-5 relative">
       <div className="w-full flex items-center justify-between">
         <Link href="/" className="font-extrabold text-2xl italic tracking-tighter text-slate-900">
          DRAFT.
         </Link>
         {rightSlot && <div className="flex items-center">{rightSlot}</div>}
       </div>
    </header>
  );
}
