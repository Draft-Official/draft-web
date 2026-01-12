'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 h-14 flex items-center px-5">
       <Link href="/" className="font-extrabold text-2xl italic tracking-tighter text-slate-900">
        DRAFT.
      </Link>
    </header>
  );
}
